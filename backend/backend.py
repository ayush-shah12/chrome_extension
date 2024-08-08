import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pandas as pd
import requests
from bs4 import BeautifulSoup
import os

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)


def get_data(school_code, prof_first, prof_last):
    url = "https://www.ratemyprofessors.com/graphql"

    headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': 'Basic dGVzdDp0ZXN0',
        'Connection': 'keep-alive',
        'Content-Length': '1467',
        'Content-Type': 'application/json',
        'Host': 'www.ratemyprofessors.com',
        'Origin': 'https://www.ratemyprofessors.com',
    }

    payload = {
        "query": """query TeacherSearchResultsPageQuery(
          $query: TeacherSearchQuery!
          $schoolID: ID
          $includeSchoolFilter: Boolean!
        ) {
          search: newSearch {
            ...TeacherSearchPagination_search_1ZLmLD
          }
          school: node(id: $schoolID) @include(if: $includeSchoolFilter) {
            __typename
            ... on School {
              name
            }
            id
          }
        }
    
        fragment TeacherSearchPagination_search_1ZLmLD on newSearch {
          teachers(query: $query, first: 8, after: "") {
            didFallback
            edges {
              cursor
              node {
                ...TeacherCard_teacher
                id
                __typename
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            resultCount
            filters {
              field
              options {
                value
                id
              }
            }
          }
        }
    
        fragment TeacherCard_teacher on Teacher {
          id
          legacyId
          avgRating
          numRatings
          ...CardFeedback_teacher
          ...CardSchool_teacher
          ...CardName_teacher
          ...TeacherBookmark_teacher
        }
    
        fragment CardFeedback_teacher on Teacher {
          wouldTakeAgainPercent
          avgDifficulty
        }
    
        fragment CardSchool_teacher on Teacher {
          department
          school {
            name
            id
          }
        }
    
        fragment CardName_teacher on Teacher {
          firstName
          lastName
        }
    
        fragment TeacherBookmark_teacher on Teacher {
          id
          isSaved
        }""",
        "variables": {
            "query": {
                "text": prof_first + " " + prof_last,
                "schoolID": school_code,
                "fallback": True,
                "departmentID": None
            },
            "schoolID": school_code,
            "includeSchoolFilter": True
        }
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    data = []
    for res in response.json()['data']['search']['teachers']['edges']:  # parsing data to be more readable
        data.append(res['node'])
    return data


def student_input(code):

    num = 15 # MAX NUMBER OF COMMENTS ALLOWED

    url = "https://www.ratemyprofessors.com/professor/" + str(code)
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    tags_html = soup.find_all('div', {'class': 'TeacherTags__TagsContainer-sc-16vmh1y-0 dbxJaW'})
    tags = []
    for tag_div in tags_html:
        spans = tag_div.find_all('span', class_='Tag-bs9vf4-0 hHOVKF')
        for span in spans:
            tags.append(span.get_text(strip=True))

    cards = soup.find_all(class_='Rating__RatingInfo-sc-1rhvpxz-3 kEVEoU')
    user_cards = []
    for card in cards[:num]:
        card_data = {}
        course = card.find('div', class_='RatingHeader__StyledClass-sc-1dlkqw1-3 eXfReS')
        if course:
            card_data['course'] = course.get_text(strip=True)
        else:
            card_data['course'] = "N/A"

        date = card.find('div', class_='TimeStamp__StyledTimeStamp-sc-9q2r30-0 bXQmMr RatingHeader__RatingTimeStamp-sc-1dlkqw1-4 iwwYJD')
        if date:
            card_data['date'] = date.get_text(strip=True)
        else:
            card_data['date'] = "N/A"

        comment = card.find('div', class_='Comments__StyledComments-dzzyvm-0 gRjWel')
        if comment:
            card_data['comment'] = comment.get_text(strip=True)
        else:
            card_data['comment'] = "N/A"

        wta_list = card.find_all('div', class_='MetaItem__StyledMetaItem-y0ixml-0 LXClX')
        for wta in wta_list:
            span = wta.find('span')
            if 'Would Take Again' in wta.get_text() and span:
                card_data['wta'] = span.get_text(strip=True)
        if 'wta' not in card_data:
            card_data['wta'] = "N/A"
        user_cards.append(card_data)

    return {
        'tags': tags,
        'userCards': user_cards
    }


@app.route('/get_professor_info', methods=['GET'])
@cross_origin()
def get_professor_info():
    # EXAMPLE SCHOOL_CODE: U2Nob29sLTEyMw== used for graphql
    # EXAMPLE SCHOOL_ID: 123

    prof_first_name = request.args.get('prof_first_name').lower()
    prof_last_name = request.args.get('prof_last_name').lower()
    school_id = request.args.get('school_code')

    school_code = set_url(school_id)

    if school_code is None:
        return jsonify({'ERROR': 651, 'MESSAGE': "COULD NOT FIND SCHOOL, BAD SCHOOL NAME", })

    data = get_data(school_code, prof_first_name, prof_last_name)

    if data is None:
        return jsonify({'ERROR': 652, 'MESSAGE': "COULD NOT FIND TEACHER, BAD NAME", })

    list_prof = data

    for prof in list_prof:

        # Check if we get an exact match for the first name and last name
        if prof.get('firstName').lower() == prof_first_name and prof.get('lastName').lower() == prof_last_name and prof.get('school').get('id') == str(school_code):
            student_in = student_input(prof.get('legacyId'))
            prof['tags'] = student_in['tags']
            prof['userCards'] = student_in['userCards']
            return jsonify(prof)
        
        # matching first name OR last name ONLY if above clause didn't trigger
        if prof.get('firstName').lower() == prof_first_name or prof.get('lastName').lower() == prof_last_name and prof.get('school').get('id') == str(school_code):
            student_in = student_input(prof.get('legacyId'))
            prof['tags'] = student_in['tags']
            prof['userCards'] = student_in['userCards']
            return jsonify(prof)

        # Check in the instance that the first name was abbreviated to only the first letter
        if len(prof_first_name) == 1 and prof.get('firstName').lower()[0] == prof_first_name[0] and prof.get('lastName').lower() == prof_last_name and prof.get('school').get('id') == str(school_code):
            student_in = student_input(prof.get('legacyId'))
            prof['tags'] = student_in['tags']
            prof['userCards'] = student_in['userCards']
            return jsonify(prof)

    # Otherwise return error.
    return jsonify({'ERROR': 653, 'MESSAGE': "COULD NOT FIND TEACHER, BAD NAME", })


def set_url(school_id):
    data = pd.read_csv("schools.csv")
    for index, row in data.iterrows():
        if row['School ID'] == int(school_id):
            return row['School Code']
    return None

def codeToName(school_id):
    data = pd.read_csv("schools.csv")
    for index, row in data.iterrows():
        if row['School Code'] == school_id:
            return row['School Name']
    return None


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port) 
