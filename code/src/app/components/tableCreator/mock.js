export const tableRulesMock = [
  {
    name: '常量1',
    type: 'const',
    observableCell: 'col1',
    description: '',
    constRules: [
      {
        cellCode: 'col10',
        observableCellExpandCode: 'address'
      },
      {
        cellCode: 'col11',
        observableCellExpandCode: 'email'
      }
    ]
  },

  {
    name: '常量2',
    type: 'const',
    observableCell: 'col2',
    description: '',
    constRules: [
      {
        cellCode: 'col10',
        observableCellExpandCode: 'address'
      },
      {
        cellCode: 'col11',
        observableCellExpandCode: 'email'
      }
    ]
  },

  {
    name: '隐藏1',
    type: 'hide',
    observableCell: 'col3',
    description: '',
    hideRules: [
      {
        observerCell: 'col12',
        conditions: [
          {
            observableCellExpandCode: 'name',
            condition: '等于',
            value: 'lalala'
          },
          {
            observableCellExpandCode: 'age',
            condition: '等于',
            value: 1
          }
        ]
      }
    ]
  },

  {
    name: '隐藏2',
    type: 'hide',
    observableCell: 'col3',
    description: '',
    hideRules: [
      {
        observerCell: 'col12',
        conditions: [
          {
            observableCellExpandCode: 'name',
            condition: '等于',
            value: 'lalala'
          },
          {
            observableCellExpandCode: 'age',
            condition: '等于',
            value: 1
          }
        ]
      },
      {
        observerCell: 'col13',
        conditions: [
          {
            observableCellExpandCode: 'address',
            condition: '等于',
            value: 'lalala'
          },
          {
            observableCellExpandCode: 'age',
            condition: '等于',
            value: 1
          }
        ]
      }
    ]
  }
]