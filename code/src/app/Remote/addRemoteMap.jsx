import React from 'react'
import { Form, Modal, Select, Radio, message } from '@uyun/components'
import TenantSelect from '~/components/RemoteTenantSelect'
import ModelSelect from './ModelSelect'
import FieldMapping from './FieldMapping'
import { newGroupData, parseDataToServer } from './logic'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
}

class AddRemoteMap extends React.Component {
  state = {
    targetModelTaches: []
  }

  async componentDidMount() {
    const { data } = this.props
    const { targetModel } = data
    if (targetModel?.key) {
      await this.getTacheById(targetModel.key)
    }
  }

  async componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.data, this.props.data)) {
      const { data } = this.props
      const { targetModel, targetModelId } = data
      if (targetModel?.key || targetModelId) {
        await this.getTacheById(targetModel?.key || targetModelId)
      }
    }
  }

  changeTargetMode = (e) => {
    if (!e) return null
    this.getTacheById(e.key)
    return e
  }

  getTacheById = (id) => {
    axios.get(API.getTacheByModelId, { params: { modelId: id, kw: '' } }).then((res) => {
      this.setState({ targetModelTaches: res })
    })
  }

  submit = () => {
    const { cancelModal, isCopy, refreshList, data: propData } = this.props
    const { validateFields, resetFields } = this.props.form
    validateFields((err, values) => {
      if (!isCopy) {
        values.id = propData.id
      }
      if (err) return
      const data = parseDataToServer({
        modelMappingInfos: values
      })
      axios.post(API.saveRemoteConfig, data).then((res) => {
        if (res === '200') {
          refreshList()
          message.success('保存成功')
          cancelModal()
          resetFields()
        }
      })
    })
  }

  render() {
    const { targetModelTaches } = this.state
    const { addVisible, data, form, cancelModal, isCopy } = this.props
    const { getFieldDecorator, getFieldValue } = form
    const {
      currentNode,
      currentModel,
      targetNode,
      targetModel,
      targetModelConfirmTache,
      writeBack
    } = newGroupData(data)
    const currentNodeId =
      (getFieldValue('currentNode') && getFieldValue('currentNode').value) ||
      (currentNode && currentNode.value)
    const targetNodeId =
      (getFieldValue('targetNode') && getFieldValue('targetNode').value) ||
      (targetNode && targetNode.value)
    const currentModelId =
      (getFieldValue('currentModel') && getFieldValue('currentModel').key) ||
      (currentModel && currentModel.key)
    const targetModelId =
      (getFieldValue('targetModel') && getFieldValue('targetModel').key) ||
      (targetModel && targetModel.key)
    return (
      <Modal
        visible={addVisible}
        title={
          _.isEmpty(data) || isCopy
            ? i18n('config.mapping.addRemoteMap')
            : i18n('config.mapping.editRemoteMap')
        }
        onOk={this.submit}
        onCancel={() => {
          this.props.form.resetFields()
          this.setState({ targetModelTaches: [] })
          cancelModal()
        }}
      >
        <Form onSubmit={this.submit}>
          <FormItem label={i18n('config.mapping.currentTenant')} {...formItemLayout}>
            {getFieldDecorator('currentNode', {
              initialValue: currentNode,
              rules: [
                {
                  required: true,
                  message: '请选择当前租户'
                }
              ]
            })(<TenantSelect onChange={() => form.setFieldsValue({ currentModel: undefined })} />)}
          </FormItem>
          <FormItem label={i18n('config.mapping.currentModel')} {...formItemLayout}>
            {getFieldDecorator('currentModel', {
              initialValue: currentModel,
              rules: [
                {
                  required: true,
                  message: '请选择当前模型'
                }
              ]
            })(
              <ModelSelect
                nodeId={currentNodeId}
                onNodeMiss={() => form.validateFields(['currentNode'])}
              />
            )}
          </FormItem>
          <FormItem label={i18n('config.mapping.targetTenant')} {...formItemLayout}>
            {getFieldDecorator('targetNode', {
              initialValue: targetNode,
              rules: [
                {
                  required: true,
                  message: '请选择目标租户'
                }
              ]
            })(<TenantSelect onChange={() => form.setFieldsValue({ targetModel: undefined })} />)}
          </FormItem>
          <FormItem label={i18n('config.mapping.targetModel')} {...formItemLayout}>
            {getFieldDecorator('targetModel', {
              initialValue: targetModel,
              rules: [
                {
                  required: true,
                  message: '请选择目标模型'
                }
              ],
              getValueFromEvent: this.changeTargetMode
            })(
              <ModelSelect
                nodeId={targetNodeId}
                onNodeMiss={() => form.validateFields(['targetNode'])}
              />
            )}
          </FormItem>
          <FormItem label="目标模型等待确认环节" {...formItemLayout}>
            {getFieldDecorator('targetModelConfirmTache', {
              initialValue: targetModelConfirmTache
            })(
              <Select labelInValue style={{ width: 200 }} disabled={!targetModelId} allowClear>
                {_.map(targetModelTaches, (d) => (
                  <Select.Option key={d.activityId}>{d.activityName}</Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="创建字段映射" {...formItemLayout}>
            <FieldMapping
              type={1}
              parNodeId={currentNodeId}
              subNodeId={targetNodeId}
              parModelId={currentModelId}
              subModelId={targetModelId}
              onModelMiss={(type) => {
                if (type === 'par') {
                  form.validateFields(['currentModel'])
                } else {
                  form.validateFields(['targetModel'])
                }
              }}
            />
          </FormItem>
          <FormItem label="是否回写" {...formItemLayout}>
            {getFieldDecorator('writeBack', {
              initialValue: writeBack || false
            })(
              <RadioGroup>
                <Radio value>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>
            )}
          </FormItem>
          {getFieldValue('writeBack') && (
            <FormItem label="回写字段映射" {...formItemLayout}>
              <FieldMapping
                type={2}
                parNodeId={targetNodeId}
                subNodeId={currentNodeId}
                parModelId={targetModelId}
                subModelId={currentModelId}
                onModelMiss={(type) => {
                  if (type === 'par') {
                    form.validateFields(['targetModel'])
                  } else {
                    form.validateFields(['currentModel'])
                  }
                }}
              />
            </FormItem>
          )}
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(AddRemoteMap)
