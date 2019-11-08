<template>
  <div>
    <div class="section">
      <h4 class="title is-4">Get Started With MBU Online</h4>
      <p>
        Pick a task on the left, or start by reading the section below to see what kind of
        tasks are available.
      </p>
      <br>
      <h4 class="title is-4">How do I...</h4>
      <ul class="faq-navigation">
        <li>
          <a href="#manage-users">Manage Users?</a>
        </li>
        <li>
          <a href="#manage-scouts">Manage Scouts?</a>
        </li>
        <li>
          <a href="#manage-events">Manage Events?</a>
        </li>
      </ul>
      <div class="question-container"
           id="manage-users">
        <h4 class="title is-4">Managing Users</h4>
        <p>
          Any users are free to sign up for MBU Online, in one of two roles: coordinator, for
          users coordinating their troop's attendance of an event; or teacher, for
          users who will be teaching or volunteering at an event. However, you will
          need to approve new accounts before a user can perform most of the tasks
          on this site.
        </p>
        <br>
        <h5 class="title is-5">Current Users</h5>
        <p>
          This is a
          <b>list of all current users</b> of MBU Online. You can view user's contact
          information from this page.
        </p>
        <br>
        <h5 class="title is-5">Need Approval</h5>
        <p>
          This page contains users who have signed up for an account, but who's account has
          <b>not yet been approved</b>. Review each account, and
          <b>approve</b> or
          <b>delete</b> the user's account accordingly.
        </p>
      </div>
      <div class="question-container"
           id="manage-scouts">
        <h4 class="title is-4">Managing Scouts</h4>
        <p>
          This section contains tasks related to the scouts that coordinators have registered
          to be part of an MBU event. This is where you can
          <b>assign</b> scouts to merit badges they have requested.
        </p>
      </div>
      <div class="question-container"
           id="manage-events">
        <h4 class="title is-4">Managing Events</h4>
        <p>
          This section is for tasks related to MBU events, such as adding
          <b>badges offered
          </b> at an event, or managing
          <b>items available for purchase</b>
          at an event.
        </p>
        <br>
        <h5 class="title is-5">Badges</h5>
        <p>
          This section is a list of all badges offered at any MBU events. In order to be able
          to list a badge as offered at an event, you should add it to this list of badges first.
        </p>
        <br>
        <h5 class="title is-5">Offerings</h5>
        <p>
          Manage
          <b>merit badge offerings</b> here. For each event, add badges that will be tought
          at that event. You can specify which periods the badge will be offered, the
          duration of the class (1 or 2 periods long), as well as any additional fees
          that scouts who take the class will need to pay.
        </p>
        <br>
        <h5 class="title is-5">Purchasables</h5>
        <p>
          This section is for
          <b>items available for purches</b> for MBU events. Add descriptions for items,
          as well as information such as whether scouts can pick a size for an item,
          and whether or not an item is age restricted.
        </p>
        <br>
        <h5 class="title is-5">Classes/Completions</h5>
        <p>
          Use this section to view a summary of attendance for all classes at an MBU event.
          Also, <strong>completion records</strong> can be added with this section.
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

.section {
  margin-top: 2rem;
  margin-bottom: 4rem;
  padding-top: 0rem;
  padding-bottom: 0rem;
}
</style>
