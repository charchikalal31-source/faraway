// ============================================================
// RailConnect - Notification System
// Supports MULTIPLE notifications at the same time
// ============================================================

window.activeRequestId = null;


// ============================================================
// Create a notification card
// ============================================================

function createNotificationCard(notification) {

    const item = document.createElement("div");
    item.className = "notif-item notif-item--unread";

    const icon = document.createElement("div");
    icon.className = "notif-item__icon";
    icon.innerText = "🔄";

    const content = document.createElement("div");
    content.className = "notif-item__content";

    const text = document.createElement("div");
    text.className = "notif-item__text";

    const time = document.createElement("div");
    time.className = "notif-item__time";
    time.innerText = "Just now";


    // --------------------------------------------------------
    // Common information
    // --------------------------------------------------------

    const trainNo = notification.train_no || "";
    const date = notification.date || "15 Jan 2026";

    const senderSeat = notification.sender_seat
        ? "CNF/B1/" + notification.sender_seat
        : "";

    const receiverSeat = notification.receiver_seat
        ? "CNF/B1/" + notification.receiver_seat
        : "";

    const requestId = notification.request_id;


    // ========================================================
    // 1. Incoming Pending Request
    // ========================================================

    if (notification.type === "incoming_pending") {

        text.innerHTML = `
            A person has requested you for
            <br>
            <strong>seat exchange</strong>.
            <br><br>

            Train: <strong>${trainNo}</strong><br>
            Date: <strong>${date}</strong><br>

            Your Seat:
            <strong>${receiverSeat}</strong><br>

            Exchange with:
            <strong>${senderSeat}</strong><br><br>

            <strong>Reason for exchange:</strong><br>

            <div class="notif-item__text">
                ${notification.reason || ""}
            </div>
        `;


        const buttons = document.createElement("div");
        buttons.className = "button";


        const acceptButton = document.createElement("button");
        acceptButton.className = "btn-acc";
        acceptButton.innerText = "ACCEPT";

        acceptButton.onclick = function () {
            accepted(requestId);
        };


        const declineButton = document.createElement("button");
        declineButton.className = "btn-dec";
        declineButton.innerText = "DECLINE";

        declineButton.onclick = function () {
            rejected(requestId);
        };


        buttons.appendChild(acceptButton);
        buttons.appendChild(declineButton);

        text.appendChild(buttons);
    }


    // ========================================================
    // 2. Incoming Accepted Request
    // ========================================================

    else if (notification.type === "incoming_accepted") {

        text.innerHTML = `
            <strong style="color:var(--green);font-size:1.2em;">
                Your seat has been changed.
            </strong>
            <br><br>

            Train: <strong>${trainNo}</strong><br>
            Date: <strong>${date}</strong><br>

            Your Current Seat:
            <strong>${senderSeat}</strong><br>
        `;
    }


    // ========================================================
    // 3. Incoming Declined Request
    // ========================================================

    else if (notification.type === "incoming_declined") {

        text.innerHTML = `
            <strong style="color:var(--red);font-size:1.2em;">
                You declined to change the seat.
            </strong>
            <br><br>

            Train: <strong>${trainNo}</strong><br>
            Date: <strong>${date}</strong><br>

            Your Seat:
            <strong>${receiverSeat}</strong><br>
        `;
    }


    // ========================================================
    // 4. Outgoing Accepted Request
    // ========================================================

    else if (notification.type === "outgoing_accepted") {

        text.innerHTML = `
            <strong style="color:var(--green);font-size:1.2em;">
                Your request to change the seat was accepted.
            </strong>
            <br><br>

            Train: <strong>${trainNo}</strong><br>
            Date: <strong>${date}</strong><br>

            Your New Seat:
            <strong>${receiverSeat}</strong><br>
        `;
    }


    // ========================================================
    // 5. Outgoing Declined Request
    // ========================================================

    else if (notification.type === "outgoing_declined") {

        text.innerHTML = `
            <strong style="color:var(--red);font-size:1.2em;">
                Your request to change the seat was declined.
            </strong>
            <br><br>

            Train: <strong>${trainNo}</strong><br>
            Date: <strong>${date}</strong><br>

            Your Seat:
            <strong>${senderSeat}</strong><br>
        `;
    }


    // --------------------------------------------------------
    // Build notification
    // --------------------------------------------------------

    content.appendChild(text);
    content.appendChild(time);

    item.appendChild(icon);
    item.appendChild(content);

    return item;
}


// ============================================================
// Display ALL notifications
// ============================================================

function showNotifications(notifications) {

    const list = document.querySelector(".notif-panel__list");

    if (!list) {
        console.error("Notification list not found.");
        return;
    }


    // Remove old notifications
    list.innerHTML = "";


    // No notifications
    if (!notifications || notifications.length === 0) {

        const empty = document.createElement("div");

        empty.className = "notif-item";

        empty.innerHTML = `
            <div class="notif-item__content">
                <div class="notif-item__text">
                    No new notifications.
                </div>
            </div>
        `;

        list.appendChild(empty);

        return;
    }


    // Create EVERY notification
    notifications.forEach(notification => {

        const card = createNotificationCard(notification);

        list.appendChild(card);

    });
}


// ============================================================
// Fetch notifications from backend
// ============================================================

async function fetchNotifications() {

    try {

        const res = await fetch("/api/notifications", {
            method: "GET",
            cache: "no-store"
        });


        if (!res.ok) {

            if (res.status === 401) {
                console.info("Not logged in, skipping notifications fetch.");
            } else {
                console.error(
                    "Failed to fetch notifications, status:",
                    res.status
                );
            }

            showNotifications([]);

            return;
        }


        const data = await res.json();


        // New backend format:
        //
        // {
        //     notifications: [...]
        // }

        const notifications = data.notifications || [];


        showNotifications(notifications);


    } catch (err) {

        console.error("Failed to load notifications:", err);

        showNotifications([]);
    }
}


// ============================================================
// ACCEPT request
// ============================================================

async function accepted(requestId) {

    if (!requestId) {

        alert("No request ID found.");

        return;
    }


    try {

        const response = await fetch(
            "/api/exchange-request/respond",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    request_id: requestId,
                    action: "accept"
                })
            }
        );


        const data = await response.json();


        if (data.success) {

            // Reload to update seat information
            window.location.reload();

        } else {

            alert(
                "Error: " +
                (data.error || "Failed to accept request")
            );
        }


    } catch (err) {

        console.error("Failed to accept:", err);

        alert("Something went wrong while accepting the request.");
    }
}


// ============================================================
// DECLINE request
// ============================================================

async function rejected(requestId) {

    if (!requestId) {

        alert("No request ID found.");

        return;
    }


    try {

        const response = await fetch(
            "/api/exchange-request/respond",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    request_id: requestId,
                    action: "decline"
                })
            }
        );


        const data = await response.json();


        if (data.success) {

            // Reload to update notification list
            window.location.reload();

        } else {

            alert(
                "Error: " +
                (data.error || "Failed to decline request")
            );
        }


    } catch (err) {

        console.error("Failed to decline:", err);

        alert("Something went wrong while declining the request.");
    }
}


// ============================================================
// Notification button click
// ============================================================

function tapnoti() {

    // Get latest notifications
    fetchNotifications();
}


// ============================================================
// Initial notification load
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    fetchNotifications();

});


// ============================================================
// Make functions available globally
// ============================================================

window.accepted = accepted;
window.rejected = rejected;
window.tapnoti = tapnoti;