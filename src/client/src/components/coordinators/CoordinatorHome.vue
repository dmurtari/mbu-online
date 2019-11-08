<template>
  <div>
    <div class="section">
      <h4 class="title is-4">
        Welcome to the Coordinator Home for MBU Online!
      </h4>
      <p>
        Pick a task on the left, or read the help section below for more information
      </p>
      <br>
      <h4 class="title is-4">How do I...</h4>
      <ul class="faq-navigation">
        <li>
          <a href="#register-scouts">Register a scout for an event?</a>
        </li>
        <li>
          <a href="#add-preferences">Add merit badge preferences?</a>
        </li>
        <li>
          <a href="#purchase-items">Purchase items?</a>
        </li>
        <li>
          <a href="#assignments">Know which classes my scouts have been assigned to?</a>
        </li>
        <li>
          <a href="#might-pay">Know how much my troop might have to pay?</a>
        </li>
        <li>
          <a href="#troop-owes">Know how much my troop owes for an event?</a>
        </li>
        <li>
          <a href="#completions">View completion records for an event?</a>
        </li>
      </ul>
      <div class="question-container"
           id="register-scouts">
        <h5 class="title is-5">Register a scout for an event?</h5>
        <p>
          To register a scout for an event, first make sure that you have added them to your troop on
          <router-link to="/coordinator/scouts">
            your troop management page</router-link>. Then, go to the
          <router-link to="/coordinator/registrations">registrations page
          </router-link>, select the event that you would like to register the scout for (the current event
          will be selected by default), and add their registration details.
        </p>
      </div>
      <div class="question-container"
           id="add-preferences">
        <h5 class="title is-5">Add merit badge preferences?</h5>
        <p>
          From the
          <router-link to="/coordinator/registrations">registrations page
          </router-link>, find the scout you would like to add preferences for. Then:
        </p>
        <br>
        <p>
          <b>If the scout has not been registered for the event:</b><br> Click the "Register" link next to
          the scout's name, and add their top six merit badge preferences for this event.
        </p>
        <br>
        <p>
          <b>If the scout has already been registered for the event:</b><br> Click the edit
          <i class="fa fa-edit"></i> button in the row of the registration. Then, select six merit badge preferences for this
          event.
        </p>
      </div>
      <div class="question-container"
           id="purchase-items">
        <h5 class="title is-5">Purchase items?</h5>
        <p>
          If items such as lunches or t-shirts are available for purchase at an MBU event, you can purchase these
          items for a scout as part of their event registration. to do so, from the
          <router-link to="/coordinator/registrations">registrations page
          </router-link>, find the scout you would like to add purchases for. Then:
        </p>
        <br>
        <p>
          <b>If the scout has not been registered for the event:</b><br> Follow the steps above to add class
          preferences. Once you click "Register Scout", you will be able to add purchases for this scout.
        </p>
        <br>
        <p>
          <b>If the scout has already been registered for the event</b><br> Click the edit
          <i class="fa fa-edit"></i> button in the row of the registration. Then, add or remove purchases for this scout.
        </p>
        <br>
        <p>
          You can select the quantity of each purchase that the scout would like to order, as well as choose sizes
          for items such as t-shirts.
        </p>
      </div>
      <div class="question-container"
           id="assignments">
        <h5 class="title is-5">
          Know which classes my scouts have been assigned to?
        </h5>
        <p>
          Once the event coordinators have looked through your scouts' preferences and assigned them to classes,
          you can view their assignments on the
          <router-link to="/coordinator/attendance">
            attendance page </router-link>.
        </p>
      </div>
      <div class="question-container"
           id="might-pay">
        <h5 class="title is-5">Know how much my troop might have to pay?</h5>
        <p>
          On the
          <router-link to="/coordinator/registrations">registrations page
          </router-link>, each registered scout has a "Projected costs" section that displays the potential
          cost of attendance for this scout. This is calculated with the event fee, any purchases that
          have been added to the registration, and any class fees in that scout's preferences.
        </p>
      </div>
      <div class="question-container"
           id="troop-owes">
        <h5 class="title is-5">Know how much my troop owes for an event?</h5>
        <p>
          On the
          <router-link to="/coordinator/attendance">attendance page
          </router-link>, each registered scout has an "Actual costs" section that displays the actual
          cost of attendance for this scout. This is calculated with the event fee, any purchases that
          have been added to the registration, and any class fees in that scout's class assignments.
        </p>
        <p>
          Additionally, the full cost of attendance for your troop is displayed at the top of the page.
        </p>
      </div>
      <div class="question-container"
           id="completions">
        <h5 class="title is-5">View completion records for an event?</h5>
        <p>
          On the
          <router-link to="/coordinator/attendance">attendance page
          </router-link>, select the event that you would like to view completion records for. Completion
          records will be listed under each period's assignment in the
          <router-link to="/coordinator/attendance/list">list view</router-link>, and under the
          <strong>Assignments</strong> header in the
          <router-link to="/coordinator/attendance/detail">detail view</router-link>.
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.faq-navigation {
  margin: 1rem 2rem 3rem 2rem;
}

.question-container {
  margin-top: 1rem;
  margin-bottom: 3rem;
}

.fa {
  margin-top: .3rem;
}
</style>
