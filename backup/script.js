// --- SIGNUP LOGIC ---
function handleSignup() {
    // Get values from the Signup Form
    const username = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const password = document.getElementById("signupPassword").value;
    const errorMsg = document.getElementById("error");

    // 1. Validate that all fields are filled
    if (!username || !email || !phone || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    // 2. Retrieve existing users from localStorage
    let users = JSON.parse(localStorage.getItem("appUsers")) || [];

    // 3. Check if the Email OR the Username is already taken
    if (users.find(u => u.email === email)) {
        errorMsg.innerText = "Email already registered.";
        return;
    }
    if (users.find(u => u.username === username)) {
        errorMsg.innerText = "Username already taken.";
        return;
    }

    // 4. Create and save the new user object
    const newUser = { username, email, phone, password };
    users.push(newUser);
    localStorage.setItem("appUsers", JSON.stringify(users));

    alert("Account created successfully! Please login with your username.");
    window.location.href = "login.html"; 
}

// USERNAME LOGIN SYSTEM 

function login(event) {
    // 1. Prevent the page from refreshing automatically
    if (event) event.preventDefault();

    let usernameInput = document.getElementById("email").value.trim(); 
    let pass = document.getElementById("password").value;
    const errorMsg = document.getElementById("error");
    
    // 2. Get the users list
    let users = JSON.parse(localStorage.getItem("appUsers")) || [];

    // 3. Find a user where the 'username' property matches the input
    const user = users.find(u => u.username === usernameInput && u.password === pass);

    if (user) {
        // 4. Set session variables
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userName", user.username);
        localStorage.setItem("userEmail", user.email); 
        
        // 5. Redirect
        window.location.href = "index.html"; 
    } else {
        // 6. Show error
        errorMsg.innerText = "Invalid Username or Password!";
    }
}

// PAGE PROTECTION

function checkLogin() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }
}

// LOGOUT


function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// Updated Header Display
document.addEventListener("DOMContentLoaded", function() {
    // Pull 'userName' which was saved during the login process
    const displayName = localStorage.getItem("userName");

    // Display the name, or "Guest" if no name is found
    document.getElementById("user").innerText = displayName || "Guest";
});

// DAILY ACTIVITY CARBON CALCULATOR

function calculate() {
  // 1. Get input values
  let electricity = document.getElementById("electricity").value || 0;
  let vehicle = document.getElementById("vehicle").value || 0;
  let gas = document.getElementById("gas").value || 0;

  // 2. Calculation logic
  let electricityCO2 = electricity * 0.82;
  let vehicleCO2 = vehicle * 0.21;
  let gasCO2 = gas * 2.3;

  let total = electricityCO2 + vehicleCO2 + gasCO2;
  let totalFixed = total.toFixed(2);
  let email = localStorage.getItem("userEmail");

  // 3. Create the data object
  let dailyData = {
    email: email,
    electricity: electricity,
    vehicle: vehicle,
    gas: gas,
    totalCO2: totalFixed,
    date: new Date().toLocaleDateString()
  };

  // THE FIX STARTS HERE

  // 4. Save to 'dailyActivity' (This keeps your Dashboard preview working)
  localStorage.setItem("dailyActivity", JSON.stringify(dailyData));

  // 5. Save to 'allActivities' (This is the "Database" for your History Page)
  // First, get the existing history list from localStorage. If it's empty, use an empty array [].
  let history = JSON.parse(localStorage.getItem("allActivities")) || [];
  
  // Add the new daily activity to the list
  history.push(dailyData);
  
  // Save the updated list back to localStorage
  localStorage.setItem("allActivities", JSON.stringify(history));

  // THE FIX ENDS HERE

  // 6. Update UI result
  document.getElementById("result").innerText =
    "Your Daily Carbon Footprint is " + totalFixed + " kg CO₂ 🌍";

  // Optional: Provide a quick alert to let the user know it's saved
  alert("Activity Saved to History!");
}

function showHome() {
  document.getElementById("homeSection").style.display = "block";
  document.getElementById("dashboardSection").style.display = "none";

  setActive("home");
}


function setActive(page) {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach(btn => btn.classList.remove("active"));

  if (page === "home") buttons[0].classList.add("active");
  if (page === "dashboard") buttons[1].classList.add("active");
}

/**
 * Loads the history of all user activities from localStorage 
 * and displays them in a table format.
 */
// Global variable to hold the chart instance
let myChart = null;
function loadHistory() {
    // 1. Retrieve the 'allActivities' array from storage
    const history = JSON.parse(localStorage.getItem("allActivities")) || [];
    const container = document.getElementById("historyList");
    const totalDisplay = document.getElementById("lifetimeTotal");

    // 2. Check if there is any data to show
    if (history.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; color: #bed4b0; text-align: center;">
                <p>No activities recorded yet. Go to the dashboard to start tracking!</p>
            </div>`;
        if (totalDisplay) totalDisplay.innerText = "0.00";
        return;
    }

    let lifetimeCO2 = 0;

    // 3. Build the table structure (Newest first)
    let html = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; color: #333;">
            <thead>
                <tr style="border-bottom: 2px solid #97b93a; color: #97b282ff;">
                    <th style="padding: 12px; text-align: left;">Date</th>
                    <th style="padding: 12px; text-align: left;">Electricity</th>
                    <th style="padding: 12px; text-align: left;">Vehicle</th>
                    <th style="padding: 12px; text-align: left;">LPG Gas</th>
                    <th style="padding: 12px; text-align: left;">Total CO₂</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Use .slice().reverse() so the table is newest-to-oldest without breaking the original data
    history.slice().reverse().forEach(item => {
        lifetimeCO2 += parseFloat(item.totalCO2);
        html += `
            <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                <td style="padding: 12px; color: white;">${item.date}</td>
                <td style="padding: 12px; color: white;">${item.electricity} kWh</td>
                <td style="padding: 12px; color: white;">${item.vehicle} km</td>
                <td style="padding: 12px; color: white;">${item.gas} kg</td>
                <td style="padding: 12px; font-weight: 600; color: #90ee90;">${item.totalCO2} kg</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    // 4. Update the Lifetime Total counter
    if (totalDisplay) {
        totalDisplay.innerText = lifetimeCO2.toFixed(2);
    }

    // 5. Trigger the Graph
    renderGraph(history);
}

function renderGraph(history) {
    const canvas = document.getElementById('footprintChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart to prevent memory leaks/overlap
    if (myChart) {
        myChart.destroy();
    }

    // Sort data for the graph (Oldest to Newest)
    const sortedData = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedData.map(item => item.date);
    const dataValues = sortedData.map(item => parseFloat(item.totalCO2));

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily CO₂ (kg)',
                data: dataValues,
                borderColor: '#90ee90',
                backgroundColor: 'rgba(144, 238, 144, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#284e0f',
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white', font: { family: 'Poppins', size: 14 } } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { display: false }
                }
            }
        }
    });
}

function generateTips() {
    const saved = localStorage.getItem("dailyActivity");
    const container = document.getElementById("tipsContainer");
    const heading = document.getElementById("tipHeading");

    if (!saved) {
        heading.innerText = "No Data Found";
        container.innerHTML = "<p>Please enter your daily activity at the Home page first to see personalized tips.</p>";
        return;
    }

    const data = JSON.parse(saved);
    heading.innerText = `Based on your ${data.totalCO2} kg CO₂ Impact:`;

    let tipsHTML = "";

    // 1. Electricity Logic (e.g., if > 8 kWh)
    if (parseFloat(data.electricity) > 8) {
        tipsHTML += `
            <div class="tip-card">
                <h3>💡 Reduce Energy</h3>
                <p>Your electricity usage is high. Switch to LED bulbs and unplug chargers when not in use to save up to 10% on your bill.</p>
            </div>`;
    }

    // 2. Vehicle Logic (e.g., if > 15 km)
    if (parseFloat(data.vehicle) > 15) {
        tipsHTML += `
            <div class="tip-card">
                <h3>🚗 Green Travel</h3>
                <p>You covered a significant distance today. Try carpooling or using public transit twice a week to cut your travel footprint in half.</p>
            </div>`;
    }

    // 3. Gas Logic (e.g., if > 0.8 kg)
    if (parseFloat(data.gas) > 0.8) {
        tipsHTML += `
            <div class="tip-card">
                <h3>🔥 Efficient Cooking</h3>
                <p>To reduce gas usage, always use lids on your pots and ensure the flame doesn't exceed the bottom of the pan.</p>
            </div>`;
    }

    // 4. Low Footprint Reward
    if (tipsHTML === "") {
        tipsHTML = `
            <div class="tip-card" style="border-left-color: gold;">
                <h3>🌟 Eco-Warrior!</h3>
                <p>Your current daily usage is low. You're doing a great job for the planet. Share your habits with friends!</p>
            </div>`;
    }

    container.innerHTML = tipsHTML;
}

