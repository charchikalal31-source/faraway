import os
import sys
import csv
import time
from flask import Flask, render_template, request, jsonify, session

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.dirname(os.path.abspath(__file__))

html_path = os.path.join(base_path, 'HTML')
data_path = os.path.join(base_path, 'Data')

app = Flask(
    __name__,
    template_folder=html_path,
    static_folder=html_path,
    static_url_path=""
)
app.secret_key = 'railconnect-dev-secret-key'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

User = {
    'Bfofa': 'Darshil_Dubey',
    'TGGABRU': 'Prabhat_Chauhan',
    'BHAI': 'Charchika_Lal',
    'Riya': 'Vanshika_Rai',
    'BHAI': 'Bhai_Secure912',
    'AmitKumar': 'Amit_Pass945',
    'Sneha_P': 'Sneha_Secure982',
    'Rajesh99': 'Rajesh_Nair011',
    'VikramS': 'Vikram_Pass034',
    'Pooja_R': 'Pooja_Tatkal078',
    'DeepakK': 'Deepak_Kush102'
}

def read_csv_file(filename):
    path = os.path.join(data_path, filename)
    try:
        with open(path, newline='', encoding='utf-8') as file:
            return list(csv.DictReader(file))
    except FileNotFoundError:
        return []


def get_users():
    return read_csv_file('User.csv')


def get_bookings():
    return read_csv_file('Bookings.csv')


def get_user_by_username(username):
    username = username.strip()
    for user in get_users():
        if user.get('Username', '').strip() == username:
            return user
    return None


def get_bookings_by_username(username):
    username = username.strip()
    return [
        booking for booking in get_bookings()
        if booking.get('Username', '').strip() == username
    ]


def get_logged_in_username():
    try:
        return session.get('username')
    except RuntimeError:
        return None


@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/home')
def home():
    username = get_logged_in_username()
    if not username:
        return render_template('login.html')
    user=get_user_by_username(username)
    # template file in HTML directory is lowercase 'home.html'
    return render_template('home.html', user=user)


@app.route('/booking')
def booking():
    return render_template('booking.html')


@app.route('/mybookings')
def mybookings():
    username = get_logged_in_username()
    if not username:
        return render_template('login.html')

    return render_template(
        'mybookings.html',
        user=get_user_by_username(username),
        bookings=get_bookings_by_username(username)
    )


@app.route('/freeze')
def freeze():
    return render_template('freeze.html')


@app.route('/seat')
@app.route('/seat.html')
@app.route('/seat-list')
@app.route('/seat-list.html')
def seat_page():
    return render_template('seat list.html')


@app.route('/final')
@app.route('/final.html')
def final_page():
    username = get_logged_in_username()
    if username:
        requests = get_exchange_requests()
        for req in reversed(requests):
            if req.get("Sender") == username and req.get("Status") == "Pending":
                return render_template('freeze.html')
    return render_template('final.html')


@app.route('/api/has-active-request')
@app.route('/api/check-request')
def api_has_active_request():
    username = get_logged_in_username()
    if not username:
        return jsonify(logged_in=False, has_request=False), 401
    
    requests = get_exchange_requests()
    for req in reversed(requests):
        if req.get("Sender") == username and req.get("Status") == "Pending":
            return jsonify(
                logged_in=True,
                has_request=True,
                request_id=req.get("RequestID"),
                receiver=req.get("Receiver"),
                train_no=req.get("TrainNo"),
                sender_seat=req.get("SenderSeat"),
                receiver_seat=req.get("ReceiverSeat"),
                reason=req.get("Reason")
            )
            
    return jsonify(logged_in=True, has_request=False)


@app.route('/api/users')
def api_users():
    return jsonify(get_users())


@app.route('/api/bookings')
def api_bookings():
    return jsonify(get_bookings())


@app.route('/api/bookings/<username>')
def api_bookings_for_user(username):
    return jsonify(get_bookings_by_username(username))


@app.route('/api/current-user')
def api_current_user():
    username = get_logged_in_username()
    if not username:
        return jsonify(logged_in=0, user=None), 401

    return jsonify(logged_in=1, user=get_user_by_username(username))


@app.route('/api/mybookings')
def api_mybookings():
    username = get_logged_in_username()
    if not username:
        return jsonify(logged_in=0, bookings=[]), 401

    return jsonify(
        logged_in=1,
        username=username,
        bookings=get_bookings_by_username(username)
    )

@app.route("/process-data", methods=["POST"])
def process_data():
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify(user_exists=0, auth=0), 400

    username = data.get("username", "").strip()
    password = data.get("password")

    if not username or not password:
        return jsonify(user_exists=0, auth=0), 400

    if username not in User:
        return jsonify(user_exists=0, auth=0)

    if User[username] == password:
        user = get_user_by_username(username)
        session['username'] = username
        return jsonify(
            user_exists=1,
            auth=1,
            username=username,
            user=user
        )

    return jsonify(user_exists=1, auth=0)


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify(success=1)


EXCHANGE_REQUESTS_FILE = 'ExchangeRequests.csv'

def init_exchange_requests_file():
    path = os.path.join(data_path, EXCHANGE_REQUESTS_FILE)
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['RequestID', 'Sender', 'Receiver', 'TrainNo', 'SenderSeat', 'ReceiverSeat', 'Reason', 'Status'])

init_exchange_requests_file()

def get_exchange_requests():
    return read_csv_file(EXCHANGE_REQUESTS_FILE)

def write_exchange_requests(requests):
    path = os.path.join(data_path, EXCHANGE_REQUESTS_FILE)
    try:
        with open(path, 'w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=['RequestID', 'Sender', 'Receiver', 'TrainNo', 'SenderSeat', 'ReceiverSeat', 'Reason', 'Status'])
            writer.writeheader()
            writer.writerows(requests)
        return True
    except Exception as e:
        print(f"Error writing exchange requests: {e}")
        return False

def write_bookings(bookings):
    path = os.path.join(data_path, 'Bookings.csv')
    try:
        with open(path, 'w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=['BookingID', 'Username', 'TrainNo', 'Class', 'Quota', 'SeatNo', 'From', 'To', 'Duration']) 
            writer.writeheader()
            writer.writerows(bookings)
        return True
    except Exception as e:
        print(f"Error writing bookings: {e}")
        return False


@app.route('/api/exchange-request', methods=['POST'])
def create_exchange_request():
    username = get_logged_in_username()
    if not username:
        return jsonify(success=False, error="Unauthorized"), 401
    
    data = request.get_json()
    if not data:
        return jsonify(success=False, error="Invalid payload"), 400
        
    sender_seat = data.get("seat", "").strip()
    lpchangeto = data.get("lpchangeto", "").strip()
    reason = data.get("lpreason", "").strip()
    
    # Extract clean target seat number
    target_seat = lpchangeto.replace("B1 • Seat ", "").replace("B1 • ", "").strip()
    if not target_seat:
        return jsonify(success=False, error="No target seat selected"), 400
        
    # Get user's bookings to find train number
    user_bookings = get_bookings_by_username(username)
    if not user_bookings:
        return jsonify(success=False, error="You do not have any bookings"), 400
        
    user_booking = user_bookings[0]
    train_no = user_booking.get("TrainNo", "").strip()
    sender_seat_actual = user_booking.get("SeatNo", "").strip()
    
    sender_from = user_booking.get("From", "").strip()
    sender_to = user_booking.get("To", "").strip()
    sender_duration = user_booking.get("Duration", "").strip()
    
    # Find receiver booking on the same train and seat
    all_bookings = get_bookings()
    receiver_booking = None
    
    for booking in all_bookings:
        if booking.get("TrainNo", "").strip() == train_no and booking.get("SeatNo", "").strip() == target_seat:
            receiver_booking = booking
            break
            
    if not receiver_booking:
        return jsonify(
        success=False,
        no_passenger=True,
        error="No passenger is currently booked on this seat."
    ), 400
    receiver_from = receiver_booking.get("From", "").strip()
    receiver_to = receiver_booking.get("To", "").strip()
    receiver_duration = receiver_booking.get("Duration", "").strip()

    if (
    sender_from != receiver_from
    or sender_to != receiver_to
    or sender_duration != receiver_duration
    ):
     return jsonify(
        success=False,
        error="You are not compatible for a seat exchange.",
        compatibility_error=True
    ), 400     
    receiver_username = receiver_booking.get("Username", "").strip()
    if receiver_username == username:
        return jsonify(success=False, error="Cannot exchange seat with yourself"), 400
        
    # Generate unique request ID
    request_id = f"EX-2026-{int(time.time())}"
    
    # Store request
    requests = get_exchange_requests()
    
    # Check if there is already a pending request
    for req_item in requests:
        if (req_item.get("Sender") == username and 
            req_item.get("Receiver") == receiver_username and 
            req_item.get("Status") == "Pending"):
            return jsonify(success=True, request_id=req_item.get("RequestID"))
            
    new_req = {
        'RequestID': request_id,
        'Sender': username,
        'Receiver': receiver_username,
        'TrainNo': train_no,
        'SenderSeat': sender_seat_actual,
        'ReceiverSeat': target_seat,
        'Reason': reason,
        'Status': 'Pending'
    }
    requests.append(new_req)
    write_exchange_requests(requests)
    
    return jsonify(success=True, request_id=request_id)


@app.route('/api/exchange-request/respond', methods=['POST'])
def respond_exchange_request():
    username = get_logged_in_username()

    if not username:
        return jsonify(success=False, error="Unauthorized"), 401

    data = request.get_json()

    if not data:
        return jsonify(success=False, error="Invalid payload"), 400

    request_id = data.get("request_id")
    action = data.get("action")  # "accept" or "decline"

    if not request_id or action not in ["accept", "decline"]:
        return jsonify(success=False, error="Invalid parameters"), 400

    requests = get_exchange_requests()

    # ---------------------------------------------------------
    # Find the request the user is responding to
    # ---------------------------------------------------------

    target_req = None

    for req_item in requests:
        if req_item.get("RequestID") == request_id:
            target_req = req_item
            break

    if not target_req:
        return jsonify(success=False, error="Request not found"), 404

    # ---------------------------------------------------------
    # Make sure the logged-in user is the receiver
    # ---------------------------------------------------------

    if target_req.get("Receiver") != username:
        return jsonify(
            success=False,
            error="Unauthorized to respond to this request"
        ), 403

    # ---------------------------------------------------------
    # Make sure the request is still pending
    # ---------------------------------------------------------

    if target_req.get("Status") != "Pending":
        return jsonify(
            success=False,
            error="Request has already been processed"
        ), 400

    # =========================================================
    # ACCEPT REQUEST
    # =========================================================

    if action == "accept":

        # -----------------------------------------------------
        # Get seat-exchange information first
        # -----------------------------------------------------

        train_no = target_req.get("TrainNo")
        sender = target_req.get("Sender")
        receiver = target_req.get("Receiver")
        sender_seat = target_req.get("SenderSeat")
        receiver_seat = target_req.get("ReceiverSeat")

        # -----------------------------------------------------
        # Find the two bookings involved in this exchange
        # -----------------------------------------------------

        bookings = get_bookings()

        sender_booking = None
        receiver_booking = None

        for b in bookings:

            if b.get("TrainNo") == train_no:

                if (
                    b.get("Username") == sender
                    and b.get("SeatNo") == sender_seat
                ):
                    sender_booking = b

                elif (
                    b.get("Username") == receiver
                    and b.get("SeatNo") == receiver_seat
                ):
                    receiver_booking = b

        # -----------------------------------------------------
        # Make sure both bookings exist BEFORE changing
        # notification/request statuses
        # -----------------------------------------------------

        if not sender_booking or not receiver_booking:

            return jsonify(
                success=False,
                error="Could not locate bookings to swap"
            ), 500

        # -----------------------------------------------------
        # Swap the seats
        # -----------------------------------------------------

        sender_booking["SeatNo"] = receiver_seat
        receiver_booking["SeatNo"] = sender_seat

        if not write_bookings(bookings):

            return jsonify(
                success=False,
                error="Failed to update bookings"
            ), 500

        # -----------------------------------------------------
        # Mark the selected request as ACCEPTED
        # -----------------------------------------------------

        target_req["Status"] = "Accepted"

        # -----------------------------------------------------
        # IMPORTANT:
        # Decline every OTHER pending request sent to the
        # same receiver.
        # -----------------------------------------------------

        for req_item in requests:

            if (
                req_item.get("RequestID") != request_id
                and req_item.get("Receiver") == username
                and req_item.get("Status") == "Pending"
            ):

                req_item["Status"] = "Declined"

    # =========================================================
    # DECLINE REQUEST
    # =========================================================

    else:

        target_req["Status"] = "Declined"

    # ---------------------------------------------------------
    # Save all exchange-request changes
    # ---------------------------------------------------------

    if not write_exchange_requests(requests):

        return jsonify(
            success=False,
            error="Failed to update exchange requests"
        ), 500

    return jsonify(success=True)


@app.route('/api/notifications', methods=['GET'])
def get_user_notifications():
    username = get_logged_in_username()

    if not username:
        return jsonify(notifications=[]), 401

    requests = get_exchange_requests()

    notifications = []

    for req in requests:

        request_id = req.get("RequestID")
        sender = req.get("Sender")
        receiver = req.get("Receiver")
        status = req.get("Status")

        notification = {
            "request_id": request_id,
            "sender": sender,
            "receiver": receiver,
            "train_no": req.get("TrainNo"),
            "sender_seat": req.get("SenderSeat"),
            "receiver_seat": req.get("ReceiverSeat"),
            "reason": req.get("Reason"),
            "date": "15 Jan 2026"
        }


        # =====================================================
        # Incoming notification
        # Receiver is the logged-in user
        # =====================================================

        if receiver == username:

            # Pending request
            if status == "Pending":
                notification["type"] = "incoming_pending"
                notifications.append(notification)

            # Accepted request
            elif status == "Accepted":
                notification["type"] = "incoming_accepted"
                notifications.append(notification)

            # Declined request
            elif status == "Declined":
                notification["type"] = "incoming_declined"
                notifications.append(notification)


        # =====================================================
        # Outgoing notification
        # Sender is the logged-in user
        # =====================================================

        elif sender == username:

            # Accepted request
            if status == "Accepted":
                notification["type"] = "outgoing_accepted"
                notifications.append(notification)

            # Declined request
            elif status == "Declined":
                notification["type"] = "outgoing_declined"
                notifications.append(notification)


    # Newest notifications first
    notifications.reverse()

    return jsonify(
        notifications=notifications
    )


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
