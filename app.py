import os

import pandas as pd
import numpy as np

import pickle
import datetime as dt

import sqlalchemy
from sqlalchemy import func
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///db/amplify_db.sqlite?check_same_thread=False")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Save table reference to a variable
data = Base.classes.amplify_db

# Create the session link
session = Session(engine)



#################################################
# Routes
#################################################

# Home Route
@app.route("/")
def home():
    return render_template("index.html")

# About Route
@app.route("/about")
def about():
    return render_template("about.html")

# Support Route
@app.route("/support")
def support():
    return render_template("support.html")
    
    
 # Database Search
@app.route("/search")
def search(bandName):       
    # Query the API table
    results = session.query(data.Artist, data.uri, data.popularity_transformed, data.average_age, data.percent_female).all()

    all_band_data = []
    for name, uri, pop, age, female in results:
        band_dict = {}
        band_dict["Artist Name"] = name
        band_dict["Spotify URI"] = uri
        band_dict["Popularity"] = pop
        band_dict["Avg. Listener Age"] = age
        band_dict["Percent Female"] = female
        all_band_data.append(band_dict)

    return jsonify(all_band_data)

# List of band names
@app.route("/bandlist")
def bandlist():       
    # Query the API table
    results = session.query(data.Artist).all()

    band_list = []
    for name in results:
        band_list.append(name[0])
    
    return jsonify(band_list)


# Route to return band metadata
@app.route("/metadata/<bandName>")
def metadata(bandName):

    bandName = bandName.replace("---","/")

    # Query the API table
    results = session.query(data).\
        filter(func.lower(data.Artist) == func.lower(bandName)).\
        statement
        
    df = pd.read_sql_query(results, session.bind)

    if df.empty:
        bandMetadata = "empty"
        return jsonify(bandMetadata)
    else:
        bandMetadata = df.to_json(orient='records')
        return bandMetadata
    
# Route to run ML models and return results
@app.route("/model/<streamsTransformed>/<percentMale>/<averageAge>/<showDateFormatted>")
def model(streamsTransformed,percentMale,averageAge,showDateFormatted):

    # One-hot encode room selection
    ROOM_BALLROOM = 1
    ROOM_TAVERN = 0

    # Reformat date, extract weekday name and month number
    showDate = pd.to_datetime(showDateFormatted)
    showDateDT = pd.DatetimeIndex([showDate])
    showDay = showDateDT.day_name()[0] # Name of weekday

    showMonth = showDateDT.month[0] # Number of month

    # Determine season from month
    if (showMonth < 3 and showMonth > 11):
        showSeason = "Winter"
    elif (showMonth < 9 and showMonth > 5):
        showSeason = "Summer"
    elif (showMonth > 2 and showMonth < 6):
        showSeason = "Spring"
    else:
        showSeason = "Fall"

    # One-hot encode day of week
    monday,tuesday,wednesday,thursday,friday,saturday,sunday = (0,0,0,0,0,0,0)

    if showDay == "Monday":
        monday = 1
    if showDay == "Tuesday":
        tuesday = 1
    if showDay == "Wednesday":
        wednesday = 1
    if showDay == "Thursday":
        thursday = 1
    if showDay == "Friday":
        friday = 1
    if showDay == "Saturday":
        saturday = 1
    if showDay == "Sunday":
        sunday = 1
    
    # One-hot encode season
    spring,summer,fall,winter = (0,0,0,0)

    if showSeason == "Spring":
        spring = 1
    if showSeason == "Summer":
        summer = 1
    if showSeason == "Fall":
        fall = 1
    if showSeason == "Winter":
        winter = 1

    #############################################################################

    # TICKET COUNT - Loading the saved model pickle
    lin_reg_model_pkl = open('models/lin_reg_tix_count_no_ROOM.pkl', 'rb')
    lin_reg_model = pickle.load(lin_reg_model_pkl)

    X_sample = np.asarray((streamsTransformed,averageAge,percentMale,spring)).astype(float)
    X_sample = X_sample.reshape(1,-1)

    prediction = lin_reg_model.predict(X_sample)

    # Final ticket sales prediction
    prediction_ticket_count = prediction

    #############################################################################

    # TICKET PRICE - Loading the saved model pickle
    lin_reg_model_pkl = open('models/lin_reg_tix_price.pkl', 'rb')
    lin_reg_model = pickle.load(lin_reg_model_pkl)

    X_sample = np.asarray((prediction_ticket_count,streamsTransformed,averageAge,percentMale,ROOM_BALLROOM,ROOM_TAVERN,friday,monday,saturday,sunday,thursday,tuesday,wednesday,fall,spring,summer,winter)).astype(float)
    X_sample = X_sample.reshape(1,-1)

    prediction = lin_reg_model.predict(X_sample)

    # Final ticket price prediction
    prediction_ticket_price = prediction

    #############################################################################

    # TICKET COUNT - ADVANCE - Loading the saved model pickle
    lin_reg_model_pkl = open('models/lin_reg_tix_adv_count.pkl', 'rb')
    lin_reg_model = pickle.load(lin_reg_model_pkl)

    X_sample = np.asarray((prediction_ticket_count,streamsTransformed,averageAge,percentMale,ROOM_BALLROOM,ROOM_TAVERN,friday,monday,saturday,sunday,thursday,tuesday,wednesday,fall,spring,summer,winter)).astype(float)
    X_sample = X_sample.reshape(1,-1)

    prediction = lin_reg_model.predict(X_sample)

    # Final advance ticket sales prediction
    prediction_ticket_count_advance = prediction

    # If predicted value is greater than predicted total ticket sales, set to total ticket sales
    if prediction_ticket_count_advance > prediction_ticket_count:
        prediction_ticket_count_advance = prediction_ticket_count

    #############################################################################

    # BAR REVENUE - Loading the saved model pickle
    lin_reg_model_pkl = open('models/lin_reg_bar_rings.pkl', 'rb')
    lin_reg_model = pickle.load(lin_reg_model_pkl)

    X_sample = np.asarray((prediction_ticket_count_advance,prediction_ticket_price,streamsTransformed,averageAge,percentMale,ROOM_BALLROOM,ROOM_TAVERN,friday,monday,saturday,sunday,thursday,tuesday,wednesday,fall,spring,summer,winter)).astype(float)
    X_sample = X_sample.reshape(1,-1)

    prediction = lin_reg_model.predict(X_sample)

    # Final bar revenue prediction
    prediction_bar_revenue = prediction

    #############################################################################

    # prediction_dict = {
    #     "totalSales": prediction_ticket_count,
    #     "ticketPrice": prediction_ticket_price,
    #     "advanceSales": prediction_ticket_count_advance,
    #     "barRevenue": prediction_bar_revenue
    # }

    prediction_list = [prediction_ticket_count,prediction_ticket_price,prediction_ticket_count_advance,prediction_bar_revenue]
    predictions = pd.Series(prediction_list).to_json(orient='values')

    return predictions

    

if __name__ == "__main__":
    app.run(debug=True)


