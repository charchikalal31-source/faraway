document.addEventListener('DOMContentLoaded', async () => {
  try {
    // get current user (returns 401 if not logged in)
    const userResp = await fetch('/api/current-user');
    if (!userResp.ok) {
      // not logged in — nothing to populate
      console.info('No logged in user');
      return;
    }
    const userJson = await userResp.json();
    const user = userJson.user || null;

    // get bookings for logged in user
    let bookings = [];
    const bookResp = await fetch('/api/mybookings');
    if (bookResp.ok) {
      const bookJson = await bookResp.json();
      bookings = Array.isArray(bookJson) ? bookJson : (bookJson.bookings || []);
    }

    const name = user?.FullName || user?.Name || user?.Username || user?.username || '';
    const dob = user?.DOB || user?.DateOfBirth || user?.dob || '';
    const gender = user?.Gender || user?.gender || '';
    const email = user?.Email || user?.email || '';

    const booking = bookings.length ? bookings[0] : null;
    const pnr = booking?.BookingID || booking?.BookingId || booking?.PNR || booking?.Pnr || booking?.pnr || '';
    const seat = booking?.SeatNo || booking?.Seat || booking?.seat || booking?.SeatNumber || '';

    // HOME PAGE elements
    const welcomeGreeting = document.getElementById('welcome_greeting');
    const nameElement = document.getElementById('name');
    const dobElement = document.getElementById('dob');
    const genderElement = document.getElementById('gender');
    const emailElement = document.getElementById('email');

    if (welcomeGreeting) welcomeGreeting.textContent = 'Welcome, ' + name + ' 👋';
    if (nameElement) nameElement.textContent = name;
    if (dobElement) dobElement.textContent = dob;
    if (genderElement) genderElement.textContent = gender;
    if (emailElement) emailElement.textContent = email;

    // MY BOOKINGS (support either 'titlpnr' or 'titlepnr' ids)
    const titlepnr = document.getElementById('titlpnr') || document.getElementById('titlepnr');
    const pnre = document.getElementById('pnr');
    const bookname = document.getElementById('passname');
    const bookgen = document.getElementById('passgen');
    let bookseat = document.getElementById('passseat');
    let bookcurstat = document.getElementById('currstat');

    if (titlepnr) titlepnr.textContent = pnr;
    if (pnre) pnre.textContent = pnr;
    if (bookname) bookname.textContent = name;
    if (bookgen) bookgen.textContent = gender ? (gender + ' | 18 Years') : '';
    if (bookseat) bookseat.textContent = seat ? ('CNF/B1/' + seat) : '';
    if (bookcurstat) bookcurstat.textContent = seat ? ('CNF/B1/' + seat) : '';

    // SEAT EXCHANGE INITIAL
    const slpnr = document.getElementById('slpnr');
    let slseat = document.getElementById('slseat');
    if (slpnr) slpnr.textContent = pnr;
    if (slseat) slseat.textContent = seat ? ('CNF/B1/' + seat) : '';

    // LAST PAGE
    const lppnr = document.getElementById('lppnr');
    const lpname = document.getElementById('lpname');
    const lppnr2 = document.getElementById('lppnr2');
    let lpcurrseat = document.getElementById('lpcurrseat');
    let lpcurrseat2 = document.getElementById('lpcurrseat2');
    let lpchangetoEl = document.getElementById('lpchangeto');
    let lpchangeto = lpchangetoEl ? lpchangetoEl.innerText : ''; 
    let lpreasonEl = document.getElementById('lpreason');
    let lpreason = lpreasonEl ? lpreasonEl.value : '';
    let lpchangeto2 = document.getElementById('lpchangeto2');
    let lpcurrseat3 = document.getElementById('lpcurrseat3');

    if (lppnr) lppnr.textContent = pnr;
    if (lpname) lpname.textContent = name;
    if (lppnr2) lppnr2.textContent = pnr;
    if (lpcurrseat) lpcurrseat.textContent = "B1 • " + seat;
    if (lpcurrseat2) lpcurrseat2.textContent = "B1 • " + seat;
    if (lpcurrseat3) lpcurrseat3.textContent = "B1 • " + seat;
    if (lpchangeto2) lpchangeto2.textContent = lpchangeto;

  } catch (err) {
    console.error('Failed to load user/bookings:', err);
  }
});

// Seat Change Mechanism
async function requestSent() {
  const seatEl = document.getElementById('lpcurrseat');
  const seat = seatEl ? seatEl.textContent.replace("B1 • ", "").trim() : "";
  
  const lpchangetoEl = document.getElementById('lpchangeto');
  const lpchangeto = lpchangetoEl ? lpchangetoEl.textContent.trim() : "";
  
  const lpreasonEl = document.getElementById('lpreason');
  const lpreason = lpreasonEl ? lpreasonEl.value.trim() : "";

  if (!lpchangeto || lpchangeto === "--") {
    alert("Please select a seat to exchange.");
    return;
  }

  try {
    const response = await fetch("/api/exchange-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ seat, lpchangeto, lpreason })
    });
    const data = await response.json();
    if (data.success) {
      console.log("Exchange request submitted successfully. ID:", data.request_id);
      const lpreqidEl = document.getElementById('lpreqid');
      if (lpreqidEl) {
        lpreqidEl.textContent = data.request_id;
      }
    } else {
      alert("Error: " + (data.error || "Failed to submit request"));
    }
  } catch (err) {
    console.error("Error sending exchange request:", err);
  }
}

window.requestSent = requestSent;





