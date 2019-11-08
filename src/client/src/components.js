import MaskedInput from 'vue-masked-input';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

import CenteredSpinner from 'components/shared/loaders/CenteredSpinner.vue';
import ClosableError from 'components/shared/ClosableError.vue';
import ConfirmDelete from 'components/shared/ConfirmDelete.vue';
import EventsDropdown from 'components/shared/EventsDropdown.vue';
import HelpTag from 'components/shared/HelpTag.vue';
import InlineDropdown from 'components/shared/InlineDropdown.vue';
import PaginatedItems from 'components/shared/pagination/PaginatedItems.vue';
import SpinnerPage from 'components/shared/loaders/SpinnerPage.vue';

export default function(Vue) {
  Vue.component('centered-spinner', CenteredSpinner);
  Vue.component('closable-error', ClosableError);
  Vue.component('confirm-delete', ConfirmDelete);
  Vue.component('events-dropdown', EventsDropdown);
  Vue.component('help-tag', HelpTag);
  Vue.component('inline-dropdown', InlineDropdown);
  Vue.component('loader', PulseLoader);
  Vue.component('masked-input', MaskedInput);
  Vue.component('paginated-items', PaginatedItems);
  Vue.component('spinner-page', SpinnerPage);
}
