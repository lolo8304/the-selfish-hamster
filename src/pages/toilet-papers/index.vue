<template>
      <!-- <h1>{{$t("pages.home.title")}}</h1> -->
      <div class="toilet-wrapper">
        <div v-if="this.currentStep === 0">
          <toilet-household-container
            @callbackNext="inputDataCallback"
            @callbackBack="navigateBack">
          </toilet-household-container>
        </div>
        <div v-if="this.currentStep === 1">
          <toilet-quarantine-container
            @callbackNext="inputDataCallback"
            @callbackBack="navigateBack">
          </toilet-quarantine-container>
        </div>
        <div v-if="this.currentStep === 2">
          <roll-quantity-container
            @callbackNext="inputDataCallback"
            @callbackBack="navigateBack">
          </roll-quantity-container>
        </div>
        <div v-if="this.currentStep === 3">
          <paper-quantity-container
            @callbackNext="inputDataCallback"
            @callbackBack="navigateBack">
          </paper-quantity-container>
        </div>
      </div>
</template>

<script>
import ToiletHouseholdContainer from './../../components/toilet-form/household-container';
import RollQuantityContainer from './../../components/toilet-form/roll-quantity-container';
import ToiletQuarantineContainer from './../../components/toilet-form/quarantine-container';
import PaperQuantityContainer from './../../components/toilet-form/paper-quantity-container';
import HamsterService from './../../services/HamsterService';

export default {
  name: 'toilet-papers',
  components: {
    ToiletHouseholdContainer,
    ToiletQuarantineContainer,
    RollQuantityContainer,
    PaperQuantityContainer,
  },
  data() {
    return ({
      currentStep: 0,
      inputData: [
        {
          value: undefined,
        },
        {
          value: undefined,
        },
        {
          value: undefined,
        },
        {
          value: undefined,
        },
        {
          value: undefined,
        },
      ],


      // entered by user
      durationQuarantineInDays: '',
      nofSheetsPerUse: '',
      nofToiletRolls: '',

      // returned by backend
      profileId: '',
      questionId: '',
      nofUsagesPerPerson: '',
      usagePerDay: '',
      usagePerQuarantine: '',
      waterConsumption: '',
    });
  },
  methods: {
    inputDataCallback(value) {
      this.inputData[this.currentStep].value = value;
      // eslint-disable-next-line no-plusplus
      this.currentStep++;

      // we have number of household, we dont need more to create profile
      if (this.currentStep === 1) {
        HamsterService.createProfile(value)
          .then(
            ((data) => {
              // eslint-disable-next-line no-console
              console.log('# set profileId', data.id);
              this.$set(this, 'profileId', data.id);
            }),
          );
      }

      if (this.currentStep === 2) {
        // eslint-disable-next-line no-console
        console.log('# set durationQuarantineInDays', value);
        this.$set(this, 'durationQuarantineInDays', value);
      }
      if (this.currentStep === 3) {
        // eslint-disable-next-line no-console
        console.log('# set nofToiletRolls', value);
        this.$set(this, 'nofToiletRolls', value);
      }
      if (this.currentStep === 4) {
        // eslint-disable-next-line no-console
        console.log('# set nofSheetsPerUse', value);
        this.$set(this, 'nofSheetsPerUse', value);
        HamsterService.createQuestions(this.profileId,
          this.durationQuarantineInDays,
          this.nofToiletRolls,
          this.nofSheetsPerUse)
          .then(
            ((data) => {
              // eslint-disable-next-line no-console
              console.log('# set questionId', data.id);
              this.$set(this, 'questionId', data.id);
              this.$router.push({ name: 'toilet-papers-result', params: { questionId: this.questionId } });
            }),
          );
      }
    },
    navigateBack() {
      if (this.currentStep === 0) {
        this.$router.push('/');
      }

      // eslint-disable-next-line no-plusplus
      this.currentStep--;
    },
  },
};
</script>

<style lang="scss">
  @import "./index.scss";
</style>
