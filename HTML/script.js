// --- SIGNUP LOGIC ---
async function handleSignup() {
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

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert("Account created successfully! Please login with your email.");
            window.location.href = "login.html";
        } else {
            errorMsg.innerText = data.error || "Registration failed";
        }
    } catch (error) {
        errorMsg.innerText = "Network error";
    }
}

// EMAIL LOGIN SYSTEM 

async function login(event) {
    // 1. Prevent the page from refreshing automatically
    if (event) event.preventDefault();

    let email = document.getElementById("email").value.trim(); 
    let password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error");
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            // 4. Set session variables
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("userId", data.id);
            localStorage.setItem("userName", data.name);
            localStorage.setItem("userEmail", email); 
            
            // 5. Redirect
            window.location.href = "index.html"; 
        } else {
            // 6. Show error
            errorMsg.innerText = data.error || "Invalid Email or Password!";
        }
    } catch (error) {
        errorMsg.innerText = "Network error";
    }
}

// PAGE PROTECTION

function checkLogin() {
  if (!localStorage.getItem("userId")) {
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

// Chart global variable
window.myChart = null;

async function calculate() {
  // 1. Get input values
  let electricity = parseFloat(document.getElementById("electricity").value) || 0;
  let vehicle = parseFloat(document.getElementById("vehicle").value) || 0;
  let gas = parseFloat(document.getElementById("gas").value) || 0;
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please login first");
    return;
  }

  let total = 0;
  const activities = [
    { type: 'electricity', value: electricity, unit: 'kWh' },
    { type: 'vehicle', value: vehicle, unit: 'km' },
    { type: 'gas', value: gas, unit: 'kg' }
  ];

  try {
    for (const activity of activities) {
      if (activity.value > 0) {
        const response = await fetch('/api/tracker/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, ...activity })
        });
        const data = await response.json();
        if (response.ok) {
          total += data.carbon_kg;
        } else {
          alert(`Error tracking ${activity.type}: ${data.error}`);
        }
      }
    }

    // 6. Update UI result
    document.getElementById("result").innerText =
      "Your Daily Carbon Footprint is " + total.toFixed(2) + " kg CO₂ 🌍";

    alert("Activity Saved!");
  } catch (error) {
    alert("Network error");
  }
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

// Global variable to hold the chart instance
let myChart = null;
async function loadHistory() {
    const userId = localStorage.getItem("userId");
    const container = document.getElementById("historyList");
    const totalDisplay = document.getElementById("lifetimeTotal");

    if (!userId) {
        container.innerHTML = "<p>Please login first</p>";
        return;
    }

    try {
        const response = await fetch(`/api/tracker/stats/${userId}`);
        const data = await response.json();
        if (!response.ok) {
            container.innerHTML = `<p>Error: ${data.error}</p>`;
            return;
        }

        const entries = data.entries || [];
        if (entries.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; color: #bed4b0; text-align: center;">
                    <p>No activities recorded yet. Go to the dashboard to start tracking!</p>
                </div>`;
            if (totalDisplay) totalDisplay.innerText = "0.00";
            return;
        }

        // Display each entry as a row
        let lifetimeCO2 = 0;
        let html = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; color: #333;">
                <thead>
                    <tr style="border-bottom: 2px solid #97b93a; color: #97b282ff;">
                        <th style="padding: 12px; text-align: left;">Date</th>
                        <th style="padding: 12px; text-align: left;">Activity</th>
                        <th style="padding: 12px; text-align: left;">Usage</th>
                        <th style="padding: 12px; text-align: left;">Carbon (kg)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        entries.forEach(entry => {
            const date = new Date(entry.logged_at).toLocaleDateString();
            const type = entry.activity_type.charAt(0).toUpperCase() + entry.activity_type.slice(1);
            const usage = `${entry.value} ${entry.activity_type === 'electricity' ? 'kWh' : entry.activity_type === 'vehicle' ? 'km' : 'kg'}`;
            lifetimeCO2 += parseFloat(entry.carbon_value);
            html += `
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                    <td style="padding: 12px; color: white;">${date}</td>
                    <td style="padding: 12px; color: white;">${type}</td>
                    <td style="padding: 12px; color: white;">${usage}</td>
                    <td style="padding: 12px; font-weight: 600; color: #90ee90;">${parseFloat(entry.carbon_value).toFixed(2)} kg</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

        if (totalDisplay) {
            totalDisplay.innerText = lifetimeCO2.toFixed(2);
        }

        // For graph, use the grouped data
        const history = Object.keys(grouped).map(date => ({
            date,
            totalCO2: grouped[date].total.toFixed(2)
        }));
        renderGraph(history);
    } catch (error) {
        container.innerHTML = "<p>Network error</p>";
    }
}

function renderGraph(history) {
    const canvas = document.getElementById('footprintChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart to prevent memory leaks/overlap
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Sort data for the graph (Oldest to Newest)
    const sortedData = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedData.map(item => item.date);
    const dataValues = sortedData.map(item => parseFloat(item.totalCO2));

    window.myChart = new Chart(ctx, {
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

async function generateTips() {
    const container = document.getElementById("tipsContainer");
    const heading = document.getElementById("tipHeading");
    const userId = localStorage.getItem("userId");

    if (!userId) {
        heading.innerText = "Please login to see tips";
        container.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`/api/tracker/stats/${userId}`);
        const data = await response.json();
        if (!response.ok || !data.entries || data.entries.length === 0) {
            heading.innerText = "No Data Found";
            container.innerHTML = "<p>Please track some activities first to see personalized tips.</p>";
            return;
        }

        const total = parseFloat(data.total_carbon_kg);
        const entries = data.entries;

        // Calculate per activity totals
        let electricityTotal = 0, vehicleTotal = 0, gasTotal = 0;
        entries.forEach(entry => {
            if (entry.activity_type === 'electricity') electricityTotal += parseFloat(entry.carbon_value);
            else if (entry.activity_type === 'vehicle') vehicleTotal += parseFloat(entry.carbon_value);
            else if (entry.activity_type === 'gas') gasTotal += parseFloat(entry.carbon_value);
        });

        heading.innerText = `Based on your activities (Total: ${total.toFixed(2)} kg CO₂):`;

        let tipsHTML = "";

        // Tips based on individual activity carbons
        if (electricityTotal > 5) {
            tipsHTML += `
                <div class="tip-card">
                    <h3>💡 Reduce Electricity Usage</h3>
                    <p>Your electricity carbon footprint is ${electricityTotal.toFixed(2)} kg. Switch to LED bulbs, unplug devices, and use energy-efficient appliances.</p>
                </div>`;
        }
        if (vehicleTotal > 3) {
            tipsHTML += `
                <div class="tip-card">
                    <h3>🚗 Lower Vehicle Emissions</h3>
                    <p>Your vehicle carbon footprint is ${vehicleTotal.toFixed(2)} kg. Try carpooling, public transport, biking, or electric vehicles.</p>
                </div>`;
        }
        if (gasTotal > 2) {
            tipsHTML += `
                <div class="tip-card">
                    <h3>🔥 Efficient Gas Usage</h3>
                    <p>Your gas carbon footprint is ${gasTotal.toFixed(2)} kg. Use lids on pots, maintain appliances, and consider induction cooking.</p>
                </div>`;
        }

        // Always show general tip
        tipsHTML += `
            <div class="tip-card">
                <h3>🌱 Plant Trees</h3>
                <p>Planting trees can offset your carbon footprint. Consider supporting reforestation projects.</p>
            </div>`;

        container.innerHTML = tipsHTML;
    } catch (error) {
        // Show default tips if API fails
        heading.innerText = "General Eco Tips";
        container.innerHTML = `
            <div class="tip-card">
                <h3>💡 Energy Saving</h3>
                <p>Switch to LED bulbs and unplug devices when not in use to reduce electricity consumption.</p>
            </div>
            <div class="tip-card">
                <h3>🚗 Sustainable Travel</h3>
                <p>Use public transport, bike, or walk instead of driving to lower your carbon footprint.</p>
            </div>
            <div class="tip-card">
                <h3>🌱 Reduce Waste</h3>
                <p>Recycle properly and avoid single-use plastics to minimize environmental impact.</p>
            </div>
        `;
    }
}

