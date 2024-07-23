from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from scrape import getData

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)


@app.route('/rmp/<prof_name>', methods=['GET'])
@cross_origin()
def rmp(prof_name):
    data = getData(prof_name)
    return data
