import React, { Component } from 'react'
import { Radio } from '@uyun/components'
import UserPicker from '~/components/userPicker'
import MatrixCondition from './MatrixCondition'

export default class FormItemUsers extends Component {
  static defaultProps = {
    onChange: () => {}
  }

  onChangeUseMatrix = (e) => {
    const { value } = this.props
    this.props.onChange(_.assign({}, value, {
      useMatrix: e.target.value
    }))
  }

  onChangeUser = (personalScope, useVariable) => {
    const { value } = this.props
    this.props.onChange(_.assign({}, value, {
      personalScope,
      useVariable
    }))
  }

  onChangeMatrixCondition = (value) => {
    this.props.onChange(_.assign({}, this.props.value, {
      matrixCondition: value
    }))
  }

  render() {
    const {
      useMatrix,
      useVariable,
      personalScope,
      matrixCondition
    } = this.props.value
    return (
      <div>
        <Radio.Group
          value={useMatrix}
          buttonStyle="solid"
          onChange={this.onChangeUseMatrix}
        >
          <Radio.Button value={0}>{i18n('choose_user', '选择人员')}</Radio.Button>
          <Radio.Button value={1}>{i18n('choose_matrix', '选择矩阵')}</Radio.Button>
        </Radio.Group>
        {
          useMatrix === 1 && <a onClick={this.handleChange} />
        }
        {
          useMatrix === 0 &&
          <UserPicker
            value={personalScope}
            extendQuery={{
              modelId: this.props.modelId
            }}
            useVariable={Boolean(useVariable)}
            onChange={this.onChangeUser} />
        }
        {
          useMatrix === 1 &&
          <MatrixCondition
            value={matrixCondition}
            onChange={this.onChangeMatrixCondition}
          />
        }
      </div>
    )
  }
}