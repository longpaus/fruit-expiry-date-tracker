import csv
import shutil
import os
from weather import get_temperature, get_humidity, get_current_date
from user import get_current_user

contentdb = "backend/content/" # Folder stores all the image/video files
id_filename = "backend/databases/content_id.txt" # File contains new unique content id
contentdb_filename = "backend/databases/contentdatabase.csv"
# Database format: ["content_id", "content_path", "user_id", "fruit_type", "upload_time", 
# "humidity", "temperature", "purchase_date", "predicted_expiry", "feedback_expiry", "consume_date"]

def get_new_cid():
    """
    Get a new unique id for an image/video
    return: integer id
    """
    id = int(open(id_filename, "r").read())
    idfile = open(id_filename, "w")
    idfile.write(str(id + 1))
    idfile.close()
    return id

def process_content(file, fruit_type, location, refrigeration, purchase_date):
    """
    Store content in the database
    return: Predicted expiry date
    """
    # Save image/video to content folder
    file_name, file_type = os.path.splitext(file)
    content_id = get_new_cid()
    content_path = contentdb + str(content_id) + file_type
    shutil.copy(file, content_path)

    # Send content to AI
    temperature = None
    if refrigeration: 
        temperature = refrigeration
    else: 
        temperature = get_temperature(location)

    humidity = get_humidity(location)
    predicted_expiry = None # Add connection to AI here

    # Add content information to database
    with open(contentdb_filename, 'a', newline='') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow([content_id, content_path, get_current_user(), fruit_type, get_current_date(location), 
                         humidity, temperature, purchase_date, predicted_expiry, None, None])
    
    return predicted_expiry

def delete_content(content_id):
    """
    Delete user content
    return: 
    """

    return

def get_user_content():
    """
    Get all user images/videos and metadata. 
    return: List of lists which contain each user image+metadata
    """

    user_content = []
    with open(contentdb_filename, mode ='r') as content_db:
        db_reader = csv.reader(content_db)
        for content in db_reader:
            if content[2] == str(None):
                user_content.append(content)

    return user_content

def get_image(content_id):
    """
    Get the image requested by the user
    return: Path to the image stored in the db
    """
    with open(contentdb_filename, mode ='r') as content_db:
        db_reader = csv.reader(content_db)
        for content in db_reader:
            if content[0] == str(content_id):
                return content[1]

def consume():
    """
    Consume a fruit/vegetable. User will no longer recieve 
    notifications regarding this product in the future. 
    return: 
    """
    return

if __name__ == '__main__':
    None
    # Tests:
    # process_content("backend/content/samplefruit.PNG", "orange", "sydney", None, "1/1/2024")
    # print(get_image(0))
