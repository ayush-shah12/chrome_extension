import asyncio
from playwright.async_api import async_playwright
from nameToCode import nameToCode


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


def set_url():
    # add backend method here
    school_name = "Stony Brook University (SUNY)"
    return str(nameToCode.get(school_name))


data = asyncio.run(main(set_url(), "lopez"))

list_prof = data[0]['data']['search']['teachers']['edges']

# iterate like this:
# for prof in list_prof:
#     print(prof['node'])
#     

# sample data 
# | | | |
# V V V V
#
# {'__typename': 'Teacher', 'avgDifficulty': 2.6, 'avgRating': 4.8, 'department': 'Physics', 'firstName':
# 'Glenn', 'id': 'VGVhY2hlci04MTIxMjA=', 'isSaved': False, 'lastName': 'Lopez', 'legacyId': 812120, 'numRatings': 5, 
# 'school': {'id': 'U2Nob29sLTk3MQ==', 'name': 'Stony Brook University (SUNY)'}, 'wouldTakeAgainPercent': 100}  
#
# {'__typename': 'Teacher', 'avgDifficulty': 2.8, 'avgRating': 4.4, 'department': 'Languages', 'firstName': 
# 'Victoriano', 'id': 'VGVhY2hlci0zMzU4NjI=', 'isSaved': False, 'lastName': 'Roncero Lopez', 'legacyId': 335862, 
# 'numRatings': 13, 'school': {'id': 'U2Nob29sLTk3MQ==', 'name': 'Stony Brook University (SUNY)'}, 
# 'wouldTakeAgainPercent': 66.6667}
