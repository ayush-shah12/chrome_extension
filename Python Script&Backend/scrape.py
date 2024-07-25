import asyncio
from playwright.async_api import async_playwright


async def main():
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

        await page.goto('https://www.ratemyprofessors.com/search/professors/971?q=tripathi')

        await browser.close()

        return responses


data = asyncio.run(main())
print(data)
