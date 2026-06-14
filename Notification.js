// Global state
window.activeRequestId = null;

// Populate and show/hide notifications
function showNotificationState(stateNum, details) {
  const sereq = document.getElementById('sereq');
  const seacc = document.getElementById('seacc');
  const sedec = document.getElementById('sedec');
  const seacc2 = document.getElementById('seacc2');
  const sedec2 = document.getElementById('sedec2');

  if (!sereq || !seacc || !sedec || !seacc2 || !sedec2) {
    // Elements not present on this page
    return;
  }

  // Hide all by default
  sereq.style.display = 'none';
  seacc.style.display = 'none';
  sedec.style.display = 'none';
  seacc2.style.display = 'none';
  sedec2.style.display = 'none';

  if (stateNum === -1 || !details) {
    return;
  }

  // Populate elements
  const ntcurseat = document.getElementById('ntcurseat');
  const ntcurseat2 = document.getElementById('ntcurseat2');
  const ntcurseat3 = document.getElementById('ntcurseat3');
  const ntcurseat4 = document.getElementById('ntcurseat4');
  const ntcurseat5 = document.getElementById('ntcurseat5');
  const ntchangeto = document.getElementById('ntchangeto');
  const ntreason = document.getElementById('ntreason');

  const senderSeatFormatted = details.sender_seat ? 'CNF/B1/' + details.sender_seat : '';
  const receiverSeatFormatted = details.receiver_seat ? 'CNF/B1/' + details.receiver_seat : '';

  if (stateNum === 0) {
    if (ntcurseat) ntcurseat.innerText = receiverSeatFormatted;
    if (ntchangeto) ntchangeto.innerText = senderSeatFormatted;
    if (ntreason) ntreason.innerText = details.reason || '';
    sereq.style.display = 'block';
  } else if (stateNum === 1) {
    if (ntcurseat2) ntcurseat2.innerText = senderSeatFormatted; // receiver's new seat is sender_seat
    seacc.style.display = 'block';
  } else if (stateNum === 2) {
    if (ntcurseat3) ntcurseat3.innerText = receiverSeatFormatted; // unchanged
    sedec.style.display = 'block';
  } else if (stateNum === 3) {
    if (ntcurseat4) ntcurseat4.innerText = receiverSeatFormatted; // sender's new seat is receiver_seat
    seacc2.style.display = 'block';
  } else if (stateNum === 4) {
    if (ntcurseat5) ntcurseat5.innerText = senderSeatFormatted; // unchanged
    sedec2.style.display = 'block';
  }
}

// Fetch notification status from backend
async function fetchNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) {
      if (res.status === 401) {
        console.info('Not logged in, skipping notifications fetch.');
      } else {
        console.error('Failed to fetch notifications, status:', res.status);
      }
      showNotificationState(-1, null);
      return;
    }
    const data = await res.json();
    window.activeRequestId = data.request_id || null;
    showNotificationState(data.response, data);
  } catch (err) {
    console.error('Failed to load notifications:', err);
    showNotificationState(-1, null);
  }
}

// Triggered when Accept is clicked
async function accepted() {
  if (!window.activeRequestId) {
    alert("No active request ID found.");
    return;
  }
  try {
    const response = await fetch("/api/exchange-request/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ request_id: window.activeRequestId, action: "accept" })
    });
    const data = await response.json();
    if (data.success) {
      // Reload page to reflect updated seat info immediately
      window.location.reload();
    } else {
      alert("Error: " + (data.error || "Failed to accept request"));
    }
  } catch (err) {
    console.error("Failed to accept:", err);
  }
}

// Triggered when Decline is clicked
async function rejected() {
  if (!window.activeRequestId) {
    alert("No active request ID found.");
    return;
  }
  try {
    const response = await fetch("/api/exchange-request/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ request_id: window.activeRequestId, action: "decline" })
    });
    const data = await response.json();
    if (data.success) {
      // Reload page to reflect updated state
      window.location.reload();
    } else {
      alert("Error: " + (data.error || "Failed to decline request"));
    }
  } catch (err) {
    console.error("Failed to decline:", err);
  }
}

// Minimal toggle for notification list click logic
function tapnoti() {
  // Fetch latest state on click
  fetchNotifications();
}

// On DOMContentLoaded, fetch notifications
document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();
});

// Expose globally
window.accepted = accepted;
window.rejected = rejected;
window.tapnoti = tapnoti;
