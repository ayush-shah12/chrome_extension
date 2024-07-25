import csv
from telnetlib import EC
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.wait import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from nameToCode import nameToCode

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-popup-blocking")
chrome_options.add_argument("--disable-notifications")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
prefs = {"profile.managed_default_content_settings.images": 2,
         "permissions.default.stylesheet": 2}
chrome_options.add_experimental_option("prefs", prefs)

service = Service(ChromeDriverManager().install())

driver = webdriver.Chrome(service=service, options=chrome_options)


def get_school_code():
    # add request call here
    school_name = "Stony Brook University (SUNY)"
    return nameToCode.get(school_name)


URL = "https://www.ratemyprofessors.com/search/professors/" + str(get_school_code()) + "?q="


def get_data(prof_name):
    # ***********FOR WEBDRIVER FOR CLOUD DEPLOYMENT, IGNORE FOR NOW***********
    # chrome_options = webdriver.ChromeOptions()
    # chrome_options.binary_location = os.environ.get("GOOGLE_CHROME_BIN")
    # chrome_service = Service(executable_path=os.environ["CHROMEDRIVER_PATH"])
    # driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    try:
        driver.get(URL + prof_name)

        # contains individual prof data
        data = driver.find_element(By.XPATH,
                                   "//div[@class='App__Body-aq7j9t-1 bhyGpW']//a["
                                   "@class='TeacherCard__StyledTeacherCard-syjs0d-0 dLJIlx']")

        info = data.text.split('\n')
        sending_data = {"name": info[3], "rating": info[1], "num_of_ratings": info[2], "difficulty": info[8],
                        "department": info[4], "percent_take_again": info[6]}
        return sending_data

    except Exception as e:
        print("Professor not Found:", e)
        return {}

    finally:
        driver.quit()

def block_popup():
    block = True
    if block:
        try:
            button = driver.find_element(By.XPATH,
                                         '//button[@class="Buttons__Button-sc-19xdot-1 CCPAModal__StyledCloseButton-sc-10x9kq-2 eAIiLw"]')
            button.click()
            block = False
        except:
            pass


if __name__ == "__main__":
    block_popup()
    data = get_data("praveen tripathi")
    print(data)
