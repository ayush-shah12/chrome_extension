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


URL = "https://www.ratemyprofessors.com/search/professors/" + get_school_code() + "?q="

driver.get(URL)


def get_data():
    # ***********FOR WEBDRIVER FOR CLOUD DEPLOYMENT, IGNORE FOR NOW***********
    # chrome_options = webdriver.ChromeOptions()
    # chrome_options.binary_location = os.environ.get("GOOGLE_CHROME_BIN")
    # chrome_service = Service(executable_path=os.environ["CHROMEDRIVER_PATH"])
    # driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    try:
        while True:
            #laods all data first
            try:
                # Pagination Button Click Handler
                button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH,
                                                "//button[@class='Buttons__Button-sc-19xdot-1 PaginationButton__StyledPaginationButton-txi1dr-1 glImpo']"))
                )
                button.click()
            except:
                break

        # contains individual prof data
        data = driver.find_elements(By.XPATH,
                                    "//div[@class='App__Body-aq7j9t-1 bhyGpW']//a[@class='TeacherCard__StyledTeacherCard-syjs0d-0 dLJIlx']")

        data_list = []
        for i in data:
            data_list.append(i.text + ";")

        new_list = []
        for i in data_list:
            temp = i.replace('\n', ',')
            temp_array = temp.split(',')
            new_list.append({
                'rating': temp_array[1],
                'name': temp_array[3],
                'difficulty': temp_array[8],
                'department': temp_array[4],
                'would_take_again': temp_array[6],
            })

        with open("test.csv", "a", newline='', encoding='utf-8') as csvfile:
            csv_writer = csv.writer(csvfile)
            for item in new_list:
                csv_writer.writerow(
                    [item["name"], item["rating"], item["difficulty"], item["department"], item["would_take_again"]])

    except Exception as e:
        print("No more pages or an error occurred:", e)
        driver.quit()

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


def get_school_departments():
    try:
        # Wait for the input element to be present
        wait = WebDriverWait(driver, 10)
        input_element = driver.find_element(By.XPATH,
                                            "//div[@class=' css-1wa3eu0-placeholder']")
        input_element.click()
        options = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "css-1u8e7rt-menu")))

        #parsing options format
        temp = []
        for option in options:
            temp.append(option.text)
            departments = temp[0].split("\n")

        # await user response place backend call here
        selected_department = "Computer Science"
        driver.find_element(By.XPATH, "//*[text()='" + selected_department + "']").click()

        #getting data from selected_department only
        get_data()

    except Exception as e:
        print(e)



block_popup()
get_school_departments()

if __name__ == "__main__":
    block_popup()
    get_school_departments()