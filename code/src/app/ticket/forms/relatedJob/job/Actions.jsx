import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Button } from '@uyun/components'

@inject('globalStore')
@observer
class Actions extends Component {
  static defaultProps = {
    field: {},
    disabled: false,
    onClick: () => {}
  }

  render() {
    const {
      field: { actionType = [] },
      disabled,
      onClick
    } = this.props
    const { relate_job } = this.props.globalStore

    if (disabled) {
      return null
    }

    return (
      <div style={{ marginBottom: '8px' }}>
        {relate_job ? (
          actionType &&
          actionType.map((type, index) => {
            let name = ''

            switch (String(type)) {
              case '1':
                name = '创建执行计划'
                break
              case '2':
                name = '创建定时作业'
                break
              case '3':
                name = '停用定时作业'
                break
              default:
                break
            }

            return (
              <Button
                key={type}
                style={{ marginLeft: index > 0 ? '8px' : 0 }}
                disabled={disabled || this.props.field.isRequired === 2}
                onClick={() => onClick(type)}
              >
                {name}
              </Button>
            )
          })
        ) : (
          <Button
            disabled={disabled || this.props.field.isRequired === 2}
            onClick={() => onClick('1')}
          >
            {i18n('job-relate', '关联作业')}
          </Button>
        )}
      </div>
    )
  }
}
export default Actions
