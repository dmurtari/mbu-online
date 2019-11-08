<template>
  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">
        <slot name="field-label"></slot>
      </label>
    </div>
    <div class="field-body">
      <div class="field">
        <div class="control">
          <slot name="field-contents"></slot>
        </div>
      </div>
    </div>
  </div>
</template>