import csv

id_filename = "backend/databases/user_id.txt" # File contains new unique user id
userdb_filename = "backend/databases/userdatabase.csv"
# Database format: [user_id, email, password, name, alert_day]

current_user = None # Holds the id of the user that is currently logged in. 

def get_new_uid():
    """
    Get a new unique id for a user
    """
    id = int(open(id_filename, "r").read())
    idfile = open(id_filename, "w")
    idfile.write(str(id + 1))
    idfile.close()
    return id

def create_user(email, name, password, password_confirmation):
    """
    Add a new user to the database
    return: Success/Error message, Success/Error code
    """
    if password != password_confirmation:
        return ("Passwords do not match", 401)

    # Check if email has already been used
    with open(userdb_filename, mode ='r') as user_db:
        db_reader = csv.reader(user_db)
        for user in db_reader:
            if user[1] == email:
                return ("Email has already been used", 401)

    # Add user to database
    with open(userdb_filename, 'a', newline='') as user_db:
        db_writer = csv.writer(user_db)
        db_writer.writerow([get_new_uid(), email, password, name, None])
    
    return ("Account Created", 201)

def get_user_details(user_id):
    """
    Get user details from the database
    return: [user_id, email, password, name]
    """

    with open(userdb_filename, mode ='r') as user_db:
        db_reader = csv.reader(user_db)
        for user in db_reader:
            if user[0] == str(user_id):
                return user

def authenticate_user(email, password):
    """
    Authenticate user for login
    return: True or False
    """

    with open(userdb_filename, mode ='r') as user_db:
        db_reader = csv.reader(user_db)
        for user in db_reader:
            if user[1] == email:
                if user[2] == password: 
                    set_current_user(int(user[0]))
                    return True
                else:
                    return False
    
    return False

def set_current_user(user_id):
    global current_user 
    current_user = user_id

def get_current_user():
    return current_user

def edit_profile(user_email, user_password, new_password, new_password_confirmation, alert_day):
    if not authenticate_user(user_email, user_password):
        return False

    if new_password != new_password_confirmation: return False

    # Update Password and alert_day

    return

if __name__ == '__main__':
    None
    # Tests: 
    # create_user("joe@gmail.com", "samplepassword123", "Joe")
    # print(get_user_details(0))
