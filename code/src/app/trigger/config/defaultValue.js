const value = [
  {
    id: 'add3c8bcd45d4d0b848a019175345fb1',
    name: '通知策略 1',
    description: null,
    createTime: '2018-04-01 15:08:00',
    builtin: 0,
    useable: 1,
    incident: 'start',
    taskEndIncident: [

    ],
    creator: null,
    when: null,
    conditionList: null,
    actionList: null,
    delay: 0,
    delayTime: 0,
    delayUnit: null,
    params: [
      {
        id: '6f87661bd7bf4a059742a8772312333c',
        name: '发送站内信',
        type: 'sendSys',
        executeParamPos: [
          {
            code: 'reciever',
            value: [
              'prevHandler',
              'resolvor',
              'creator',
              'follower',
              'a60967fb427b4c9db984956ac0e5841b',
              'a1a3c5df9f154b898c2c81eb60511358',
              'e809b4b284564aaf87eda0f88b7b9c38',
              '5560bb797c824797a30c4d69aaa804cb',
              '12e7c713930e4b34be76411e44801204',
              'd20f33d355d9497fb67c51e92613a87d',
              '32cb6ac7fc94470abcbd4a1a9dea7190',
              'bf6519efb8f0452499c97799e65b72a4',
              'c0df7a92bfef46b89704f977f7128f8a',
              '357321dfedb34ba18c2299470a59f051',
              'acf617df1605498281b36d88261dbd67',
              'db0385f3180d4fe58acf34be8d11764e',
              '5215b479463f4f4fbc95c4b4b1256195',
              '36b4585b7af94edf95f14ac464bdf0e2',
              '38375858e2ee42bf92a5358468c0b950'
            ],
            type: 2,
            name: '收信人'
          },
          {
            code: 'content',
            value: '是的冯绍峰',
            type: 3,
            name: '站内信内容'
          }
        ]
      }
    ],
    key: null,
    timeStrategyVo: null,
    triggerConditions: {
      when: 'all',
      conditionExpressions: [

      ],
      nestingConditions: [

      ]
    },
    triggerType: '1',
    testCreateTicket: null
  }
]
export default value
