import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { expect } from 'chai'

import CoordinatorDetail from './CoordinatorDetail.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('CoordinatorDetail.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(CoordinatorDetail, {
      localVue,
      propsData: {
        id: 1
      }
    });

    wrapper.vm.loading = false;
    wrapper.vm.user = {};
  });

  it('should exist', () => {
    expect(wrapper.isVueInstance()).to.be.true;
  });

  it('should not show the edit form', () => {
    expect(wrapper.vm.editing).to.be.false;
    expect(wrapper.findAll('edit-profile')).to.have.lengthOf(0);
  });
});
