import React, { Component } from 'react'
import { Modal } from '@uyun/components'
import SimpleForm from '~/components/SimpleForm'

export default class ScenesEdit extends Component {
  static defaultProps = {
    onOk: () => {},
    onCancel: () => {}
  }

  constructor(props) {
    super(props)
    this.scenes = React.createRef()
    this.state = {
      loading: false
    }
  }

  onOk = () => {
    this.scenes.current.props.form.validateFields(async(errors, values) => {
      if (errors) return false
      this.setState({ loading: true })
      await this.props.onOk(values)
      this.setState({ loading: false })
    })
  }

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const { scenes } = this.props
    const { name, code, description } = scenes || {}
    const { loading } = this.state
    const list = [{
      code: 'name',
      name: i18n('conf.model.field.card.name', '名称'),
      type: 'signleRowText',
      value: name,
      required: true,
      disabled: false
    }, {
      code: 'code',
      name: i18n('conf.model.field.code', '编码'),
      type: 'signleRowText',
      value: code,
      required: true,
      disabled: !_.isEmpty(code)
    }, {
      code: 'description',
      name: i18n('conf.model.field.desc', '描述'),
      type: 'multiRowText',
      value: description
    }]
    return (
      <Modal
        title="新建规则包"
        destroyOnClose
        confirmLoading={loading}
        visible={!_.isEmpty(scenes)}
        onOk={this.onOk}
        onCancel={this.onCancel}
      >
        <SimpleForm
          list={list}
          wrappedComponentRef={this.scenes}
        />
      </Modal>
    )
  }
}