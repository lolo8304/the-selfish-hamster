import { ObjectID } from 'mongodb';
import { EmergencyStockQuestion } from '../entity/EmergencyStockQuestion';
import { CRUDServices } from '../services/CRUDServices';
import { EmergencyStockAnswer } from '../entity/EmergencyStockAnswer';
import { Profile } from '../entity/Profile';
import { FoodCategories } from '../services/FoodCategories';

import { Content } from '../services/AnswerContent';

// eslint-disable-next-line import/prefer-default-export
export class EmergencyStockAnswerServices {
  // eslint-disable-next-line class-methods-use-this
  Register(prefix, app, connection) {
    const profileRepository = connection.getRepository(Profile);
    const emergencyStockQuestionRepository = connection.getRepository(EmergencyStockQuestion);
    const emergencyStockAnswerRepository = connection.getRepository(EmergencyStockAnswer);
    const modelName = '/emergency-stock/answers';

    new CRUDServices().Register(prefix, app, connection, modelName, EmergencyStockAnswer);

    app.post(`${prefix}/emergency-stock/questions/:id/answer`, async (req, res) => {
      const question = await emergencyStockQuestionRepository.findOne(new ObjectID(req.params.id));
      const profile = await profileRepository.findOne(new ObjectID(question.profileId));
      // eslint-disable-next-line max-len
      let answer = await emergencyStockAnswerRepository.findOne({ where: { questionId: question.id } });
      answer = this.CalculateEmergencyStockUsage(profile, question, answer);
      await emergencyStockQuestionRepository.save(question);
      const resultAnswer = await emergencyStockAnswerRepository.save(answer);
      return res.status(201)
        .send(resultAnswer);
    });

    app.get(`${prefix}/emergency-stock/questions/:id/answer`, async (req, res) => {
      // eslint-disable-next-line max-len
      const resultAnswer = await emergencyStockAnswerRepository.findOne({ where: { questionId: new ObjectID(req.params.id) } });
      return res.status(201)
        .send(resultAnswer);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  CalculateEmergencyStockUsage(profile, question, answer) {
    let currentAnswer = answer;
    if (!answer) {
      currentAnswer = new EmergencyStockAnswer();
    }
    currentAnswer.timestamp = new Date();
    currentAnswer.questionId = question.id.toString();
    currentAnswer.profileId = profile.id.toString();
    currentAnswer.durationQuarantineInDays = question.durationQuarantineInDays;

    const resultCategories = new FoodCategories().List();
    const questionCategories = question.categories;
    const newQuestionCategories = [];

    const estimates = new FoodCategories().CategegoryEstimates(
      profile.nofAdults, profile.nofKidsUnder12, question.durationQuarantineInDays);
    for (const resultCategory of resultCategories) {
      const foundCatValue = this.GetCategoryByIndex(questionCategories, resultCategory.index);
      newQuestionCategories.push(
        { index: resultCategory.index, tag: resultCategory.tag, value: foundCatValue.value, included: foundCatValue.included },
      );

      resultCategory.value = foundCatValue.value;
      resultCategory.included = foundCatValue.included;

      resultCategory.estimatesPerQuarantineInDays = estimates[resultCategory.index].estimatesPerQuarantineInDays;
      resultCategory.estimatedValuePerQuarantineInDays = resultCategory.estimatesPerQuarantineInDays[resultCategory.value];
    }
    question.categories = newQuestionCategories;
    currentAnswer.categories = resultCategories;
    currentAnswer.hamsterType = this.CalculateHamsterType(currentAnswer);

    return currentAnswer;
  }

  CalculateHamsterType(currentAnswer) {
    return 'average';
  }

  GetCategoryByIndex(categories, index) {
    for (const cat of categories) {
      if (cat.index === index) {
        return { value: cat.value, included: cat.included };
      }
    }
    return { value: 2, included: true };
  }
}
