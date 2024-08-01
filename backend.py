from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from playwright.sync_api import sync_playwright, Playwright
from nameToCode import nameToCode
import os

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)

chrome_binary_location = os.environ.get("GOOGLE_CHROME_BIN")
chromium_executable_path = os.environ.get("CHROMEDRIVER_PATH")

browser = None
context = None

def setup_browser():
    global browser, context
    if browser is None:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path=chromium_executable_path,
                headless=True,
                args=[
                    f'--binary={chrome_binary_location}',
                    '--no-sandbox',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-dev-shm-usage'
                ]
            )
            context = browser.new_context()

def close_browser():
    global browser
    if browser:
        browser.close()
        browser = None


def main(url, prof_name):
    global context
    responses = []
    page = context.new_page()

    def handle_route(route, request):
        if "graphql" in request.url and request.method == "POST":
            response = route.fetch()
            json_data = response.json()
            responses.append(json_data)
        else:
            route.continue_()

    page.route("**/graphql", handle_route)

    page.goto('https://www.ratemyprofessors.com/search/professors/' + str(url) + '?q=' + prof_name)

    page.close()

    return responses


def set_url(school_name):
    return nameToCode.get(school_name)


def genComment(comments):
    if not comments:
        return "No comments were found for this professor."
    else:
        return "Temporary comment, will add this AI comment later."


@app.route('/get_professor_info', methods=['GET'])
@cross_origin()
def get_professor_info():
    prof_first_name = request.args.get('prof_first_name').lower()
    prof_last_name = request.args.get('prof_last_name')
    school_name = request.args.get('school_name')

    if set_url(school_name) is None:
        return jsonify({'ERROR': 651, 'MESSAGE': "COULD NOT FIND SCHOOL, BAD SCHOOL NAME", })

    data = main(set_url(school_name), prof_last_name)

    list_prof = data[0]['data']['search']['teachers']['edges']

    if not list_prof:
        return jsonify({'ERROR': 652, 'MESSAGE': "COULD NOT FIND TEACHER, BAD LAST NAME", })

    for prof in list_prof:
        # Check if we get an exact match for the first name
        if prof['node'].get('firstName').lower() == prof_first_name.lower():
            prof['node']['comment'] = genComment([])
            return jsonify(prof['node'])
        # Check in the instance that the first name was abbreviated to only the first letter
        if len(prof_first_name) == 1 and prof['node'].get('firstName').lower()[0] == prof_first_name.lower()[0]:
            prof['node']['comment'] = genComment([])
            return jsonify(prof['node'])
    # Otherwise return error.
    return jsonify({'ERROR': 653, 'MESSAGE': "COULD NOT FIND TEACHER, BAD FIRST NAME", })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    try:
        setup_browser()
        app.run(host='0.0.0.0', port=port) 
    finally:
        close_browser()