from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import asyncio
from playwright.async_api import async_playwright
from nameToCode import nameToCode

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)


async def main(url, prof_name):
    async with async_playwright() as p:

        responses = []

        browser = await p.chromium.launch(headless=True, proxy=None,
                                          args=['--no-sandbox', '--headless', '--disable-gpu', '--disable-web-security',
                                                '--disable-dev-sherlock', '--disable-infobars', '--disable-extensions',
                                                '--disable-dev-tools'])
        context = await browser.new_context()
        page = await context.new_page()

        async def handle_route(route, request):
            if "graphql" in request.url and request.method == "POST":
                response = await route.fetch()
                json_data = await response.json()
                responses.append(json_data)
            else:
                await route.continue_()

        await page.route("**/graphql", handle_route)

        await page.goto('https://www.ratemyprofessors.com/search/professors/' + url + '?q=' + prof_name)

        await browser.close()

        return responses


def set_url(school_name):
    return str(nameToCode.get(school_name))


def genComment(comments):
    if not comments:
        return "No comments were found for this professor."
    else:
        return "Temporary comment, will add this AI comment later."


@app.route('/get_professor_info', methods=['GET'])
@cross_origin()
def get_professor_info():
    prof_first_name = request.args.get('prof_first_name')
    prof_last_name = request.args.get('prof_last_name')
    school_name = request.args.get('school_name').lower()

    if set_url(school_name) == "None":
        return jsonify("ERROR: COULD NOT FIND SCHOOL")

    data = asyncio.run(main(set_url(school_name), prof_last_name))

    list_prof = data[0]['data']['search']['teachers']['edges']

    if not list_prof:
        return jsonify("ERROR: COULD NOT FIND TEACHER, BAD LAST NAME")

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
    return jsonify("ERROR: COULD NOT FIND TEACHER, BAD FIRST NAME")


if __name__ == '__main__':
    app.run(debug=True)
