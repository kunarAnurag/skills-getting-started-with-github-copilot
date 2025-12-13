document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const template = document.getElementById("activity-card-template");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and select options (keep default)
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const spotsLeft = details.max_participants - (details.participants?.length || 0);

        // Clone template and fill in values
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector(".activity-card");
        clone.querySelector(".activity-title").textContent = name;
        clone.querySelector(".activity-desc").textContent = details.description;
        clone.querySelector(".activity-schedule").innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        // Add availability paragraph
        const availabilityP = document.createElement("p");
        availabilityP.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;
        card.appendChild(availabilityP);

        // Populate participants list or show empty state
        const participantsList = clone.querySelector(".participants-list");
        const participantsEmpty = clone.querySelector(".participants-empty");
        participantsList.innerHTML = "";

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.textContent = p;
            participantsList.appendChild(li);
          });
          participantsList.classList.remove("hidden");
          participantsEmpty.classList.add("hidden");
        } else {
          participantsList.classList.add("hidden");
          participantsEmpty.classList.remove("hidden");
        }

        activitiesList.appendChild(clone);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities to show updated participants
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
