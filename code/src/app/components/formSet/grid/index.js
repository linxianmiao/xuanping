import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Modal, message, Table, Input, Button, Tooltip } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import uuidv4 from '~/utils/uuid'
import Edit from './edit'
import EditGuide from '~/components/ticketGuide/editGuide'
import moment from 'moment'
import styles from './index.module.less'
import './index.less'
const CURRENTMODEL = {
  name: undefined,
  description: undefined,
  fieldList: [],
  formLayoutVos: [],
  isOperateGuide: 0,
  operateGuide: undefined
}

@inject('formSetGridStore', 'basicInfoStore', 'globalStore')
@observer
class Grid extends Component {
  state = {
    visible: '',
    confirmLoading: false,
    currentModel: {}
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  handleClick = (visible, currentModel = CURRENTMODEL) => {
    const { modelId, id } = currentModel
    switch (visible) {
      case 'add':
      case 'rename':
        this.setState({ visible, currentModel })
        break
      case 'copy':
        this.setState({ visible, currentModel: { id, modelId } })
        break
      case 'del':
        this.handleDel(currentModel)
        break
      case 'edit':
        this.handleEdit(currentModel, 'edit')
        break
      case 'template':
        this.handlePublicTemplate(currentModel)
        break
      case 'guide':
        this.setState({ visible, currentModel })
        break
      default:
        this.setState({ visible, currentModel })
    }
  }

  handleOk = () => {
    this.cardModel.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      this.setState({ confirmLoading: true })
      const { visible, currentModel } = this.state
      const modelData = _.assign({}, currentModel, values)
      if (modelData.externalForm) {
        const { modelId } = this.context
        await this.props.formSetGridStore.saveModelForm({ ...modelData, modelId }, 1)
        this.setState({ confirmLoading: false, visible: '' })
        this.props.formSetGridStore.getGridList(modelId)
      } else {
        if (visible === 'rename') {
          await this.props.formSetGridStore.saveModelForm(modelData, 1)
          this.props.formSetGridStore.getGridList(modelData.modelId)
        } else {
          this.handleEdit(modelData, visible)
        }
        this.setState({ confirmLoading: false, visible: '', currentModel: {} })
      }
    })
  }

  handGuideleOk = () => {
    this.guideModel.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      this.setState({ confirmLoading: true })
      const { currentModel } = this.state
      // isOperateGuide Switch组件需要布尔值，后端接口需要数字
      const modelData = _.assign({}, currentModel, values, {
        isOperateGuide: Number(values.isOperateGuide)
      })
      await this.props.formSetGridStore.saveModelForm(modelData, 1)
      this.props.formSetGridStore.getGridList(modelData.modelId)
      this.setState({ confirmLoading: false, visible: '', currentModel: {} })
    })
  }

  handlePublicTemplate = async (currentModel) => {
    const { id } = currentModel
    const res = await this.props.formSetGridStore.publishFormTemplate(id)
    if (_.isObject(res)) {
      message.success(i18n('public-template-success', '发布成功'))
    }
  }

  handleEdit = async (currentModel, visible) => {
    const { id, modelId } = currentModel
    if (visible === 'add') {
      const { fieldList } = this.props.formSetGridStore
      let fields = _.filter(fieldList, (field) => _.includes(['title'], field.code))
      fields = _.map(fields, (field) => {
        return _.assign({}, field, {
          fieldLayout: { col: 12 },
          isRequired: 1,
          fieldLabelLayout: 'vertical'
        })
      })
      this.props.formSetGridStore.setData(
        _.assign({}, currentModel, {
          fieldList: fields,
          formLayoutVos: [
            {
              name: i18n('conf.model.basicInfo', '基本信息'),
              type: 'group',
              id: uuidv4(),
              description: undefined,
              fieldList: fields,
              fold: 0
            }
          ]
        }),
        'currentGrid'
      )
    } else if (visible === 'edit') {
      await this.props.formSetGridStore.getModelForm(id, modelId, currentModel, visible)
    } else if (visible === 'copy') {
      await this.props.formSetGridStore.getModelForm(id, modelId, currentModel, visible)
    }
    this.props.handleChangeFieldType('formLayout')
  }

  // 删除
  handleDel = (model) => {
    const { tacheList, id, modelId } = model
    if (_.isEmpty(tacheList)) {
      Modal.confirm({
        title: i18n('conf.model.del.card', '确定要删除吗？'),
        onOk: async () => {
          await this.props.formSetGridStore.deleteGard(id)
          this.props.formSetGridStore.getGridList(modelId)
        }
      })
    } else {
      Modal.warning({
        title: i18n('conf.model.field.warn1', '表单已被引用，请先解除引用关系后可删除')
      })
    }
  }

  render() {
    const { loading, gridList, formListKw } = this.props.formSetGridStore
    const { modelStatus } = this.props.basicInfoStore
    const { showStatusButton } = this.props.globalStore
    const { visible, confirmLoading, currentModel } = this.state
    const dilver = {
      ...currentModel,
      handleClick: this.handleClick
    }
    const existNameList = _.map(gridList, (item) => item.name)
    // 模型状态为开发中时
    const canOperate =
      (modelStatus === -1 && !showStatusButton) || showStatusButton || window.LOWCODE_APP_KEY

    const columns = [
      {
        title: i18n('form.name', '表单名称'),
        dataIndex: 'name',
        render: (name, record) => {
          const tacheList = record.tacheList && record.tacheList.join(', ')
          return (
            <Tooltip title={tacheList || undefined}>
              <a onClick={() => this.handleClick('edit', record)}>{name}</a>
            </Tooltip>
          )
        }
      },
      {
        title: i18n('form.description', '表单说明'),
        dataIndex: 'description'
      },
      {
        title: i18n('form.latelyModifyUserName', '修改人'),
        dataIndex: 'latelyModifyUserName'
      },
      {
        title: i18n('form.updateTime', '修改时间'),
        dataIndex: 'updateTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
      }
    ]

    if (canOperate) {
      columns.push({
        title: i18n('ticket.create.operate', '操作'),
        width: 280,
        render: (record) => {
          // canPublish是否可以发布为模板，表单中有子表单的不能发布为模板
          // externalForm 外部表单不能复制
          const { canPublish, externalForm } = record
          return (
            <Button.Group type="link">
              {canPublish && (
                <a onClick={() => this.handleClick('template', record)}>
                  {i18n('publish-as-template', '发布模板')}
                </a>
              )}
              <a onClick={() => this.handleClick('rename', record)}>{i18n('eidt', '编辑')}</a>
              {externalForm !== 1 && (
                <a onClick={() => this.handleClick('copy', record)}>{i18n('copy', '复制')}</a>
              )}
              {externalForm !== 1 && (
                <a onClick={() => this.handleClick('guide', record)}>
                  {i18n('flow-guide', '流程指引')}
                </a>
              )}
              <a onClick={() => this.handleClick('del', record)}>{i18n('delete', '删除')}</a>
            </Button.Group>
          )
        }
      })
    }

    return (
      <React.Fragment>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <Input.Search
              style={{ width: 198 }}
              placeholder={i18n('input_keyword', '请输入关键字')}
              allowClear
              enterButton
              value={formListKw}
              onChange={(e) => this.props.formSetGridStore.setData(e.target.value, 'formListKw')}
              onSearch={() => this.props.formSetGridStore.getGridList(this.context.modelId)}
              onClear={() => {
                this.props.formSetGridStore.setData(undefined, 'formListKw')
                this.props.formSetGridStore.getGridList(this.context.modelId)
              }}
            />
            {canOperate && (
              <Button type="primary" onClick={() => this.handleClick('add')}>
                {i18n('conf.model.fields.new.field', '新建表单')}
              </Button>
            )}
          </div>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={toJS(gridList)}
            pagination={false}
          />
        </div>

        <Modal
          destroyOnClose
          title={
            visible !== 'add'
              ? i18n('conf.model.fields.edit.field', '编辑表单')
              : i18n('conf.model.fields.new.field', '新建表单')
          }
          visible={Boolean(visible) && visible !== 'guide'}
          confirmLoading={confirmLoading}
          onOk={this.handleOk}
          onCancel={() => {
            this.handleClick('', undefined)
          }}
        >
          <Edit
            wrappedComponentRef={(inst) => {
              this.cardModel = inst
            }}
            {...dilver}
            existNameList={existNameList}
            disabled={visible !== 'add'}
          />
        </Modal>
        <Modal
          destroyOnClose
          title={i18n('flow-guide', '流程指引')}
          visible={visible === 'guide'}
          confirmLoading={confirmLoading}
          onOk={this.handGuideleOk}
          onCancel={() => {
            this.handleClick('', undefined)
          }}
          size="large"
        >
          <EditGuide
            wrappedComponentRef={(inst) => {
              this.guideModel = inst
            }}
            {...dilver}
          />
        </Modal>
      </React.Fragment>
    )
  }
}
export default Grid
