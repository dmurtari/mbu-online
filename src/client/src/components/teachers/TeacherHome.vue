<template>
  <div>
    <div class="section">
      <h4 class="title is-4">
        Welcome to the Instructor Home for MBU Online!
      </h4>
      <p>
        Pick a task on the left, or read the help section below for more information
      </p>
      <br>
      <h4 class="title is-4">How do I...</h4>
      <ul class="faq-navigation">
        <li>
          <a href="#assignments">Edit class assignments?</a>
        </li>
        <li>
          <a href="#view">View the scouts in a class?</a>
        </li>
        <li>
          <a href="#completions">Edit completion records?</a>
        </li>
      </ul>
      <div class="question-container"
           id="assignments">
        <h5 class="title is-5">Edit class assignments?</h5>
        <p>
          To edit class assignments, go to the the
          <router-link to="assignments/detail">Event Assignments</router-link>
          page and navigate to the
          <router-link to="assignments/detail">Detail tab</router-link>. Pick the event that you are editing class assignments for. You can
          also filter by troops registered for an event, or search for a scout directly. Then, click the
          edit button next to the scout who's assignments you would like to edit.
        </p>
      </div>
      <div class="question-container"
           id="view">
        <h5 class="title is-5">View the scouts in a class?</h5>
        <p>
          Navigate to the
          <router-link to="classes">Class Information/Completions</router-link> section. Pick the event that you would like to see
          class information for. You will be able to see the number of scouts registered for each period
          of a class. To view more information (such as the name and troop of scouts assigned to a class),
          click the
          <strong>details</strong> link next to the class.
        </p>
      </div>
      <div class="question-container"
           id="completions">
        <h5 class="title is-5">Edit completion records?</h5>
        <p>
          Navigate to the
          <router-link to="classes">Class Information/Completions</router-link> section. Find the class you would like to edit completion
          records for, and click
          <strong>Details</strong>. Then, on the details page, click
          <strong>Edit Completions</strong> next to the class period you would like to edit completions for. Enter
          in a list of comma separated items, and save.
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
</style>