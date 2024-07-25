import React, { Component, lazy } from 'react'
import {
  Button,
  Modal,
  Card,
  Collapse,
  Checkbox,
  Form,
  Row,
  Col,
  TreeSelect
} from '@uyun/components'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { DeleteOutlined } from '@uyun/icons'
import _ from 'lodash'
import './linkUrl.less'
const FormItem = Form.Item
const { Panel } = Collapse
function getList(arr) {
  if (!_.isArray(arr)) {
    throw new Error('传入的不是数组')
  }
  return arr.reduce((prev, item) => {
    if (item.dataType === 'layer') {
      return [...prev, ...getList(item.children)]
    } else {
      return [...prev, item]
    }
  }, [])
}
@inject('resourceStore')
@observer
export default class CiFormAuthority extends Component {
  state = {
    visible: false,
    blur: true,
    resTypeList: [],
    expandField: [],
    selectData: [],
    current: [],
    names: []
  }

  changeCheck = (index, inde, ind, value, type) => {
    const { expandField } = this.state
    expandField[index][inde].ciAttributeVos[ind][type] = value ? 1 : 0
    this.setState({
      expandField
    })
  }

  renderOption = (group) => {
    const arr = _.map(group, (item) => {
      item.key = item.code
      if (item.dataType === 'layer') {
        item.key = `${item.code}-${item.dataType}`
        item.disabled = true
        item.children = this.renderOption(item.children)
      }
      return item
    })
    return arr
  }

  componentDidMount() {
    const { resType, formType, checkEditPermission } = this.props
    const data = _.map(resType, (res) => res.key)
    this.props.resourceStore
      .queryAllResType({ classCodes: data.join(','), formType: formType, checkEditPermission })
      .then((res) => {
        const data = this.renderOption(res)
        this.setState({
          resTypeList: data || [],
          names: getList(data)
        })
      })
    if (this.props.value) {
      const arr = _.map(this.props.value, (ci, index) => index)
      this.setState({
        expandField: this.props.value,
        selectData: arr
      })
    }
  }

  componentWillReceiveProps(nP) {
    if (nP.code !== this.props.code) {
      const { resType, formType } = nP
      const data = _.map(resType, (res) => res.key)
      this.props.resourceStore
        .queryAllResType({ classCodes: data.join(','), formType: formType })
        .then((res) => {
          const data = this.renderOption(res)
          this.setState({
            resTypeList: data || [],
            names: getList(data)
          })
        })
      if (nP.value) {
        const arr = _.map(nP.value, (ci, index) => index)
        this.setState({
          expandField: nP.value,
          selectData: arr
        })
      }
    }
  }

  toggle = () => {
    this.setState({
      visible: true
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  handleOk = () => {
    this.props.onChange(this.state.expandField)
    this.handleCancel()
  }

  setResource = () => {
    this.setState({
      blur: false
    })
  }

  delResource = (index) => {
    const { expandField, selectData } = this.state
    delete expandField[index]
    const data = _.filter(selectData, (data) => data !== index)
    this.setState({
      expandField,
      selectData: data
    })
  }

  handleSelectChange = (value) => {
    if (_.isEmpty(value)) {
      this.setState({ expandField: {}, selectData: [] })
    } else {
      this.props.resourceStore
        .queryAssetExpand({
          classCodes: value.join(','),
          formType: this.props.formType
        })
        .then((res) => {
          const { expandField } = this.state
          const newExpandField = _.assign(res, expandField)
          this.setState({
            expandField: newExpandField,
            selectData: value
          })
        })
    }
  }

  render() {
    const { resTypeList, selectData, visible, expandField, names } = this.state
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    }
    return (
      <>
        <div className="field-detail-content">
          <Button type="primary" onClick={this.toggle}>
            {i18n('field_value_resource_range1', '配置属性范围')}
          </Button>
        </div>
        <Modal
          title={i18n('field_value_resource_range1', '配置属性范围')}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="75%"
        >
          <div className="resouce-setting">
            <Button type="primary" onClick={this.setResource} className="resource-btn">
              {_.isEmpty(selectData)
                ? i18n('field_value_resource_rangeSelect', '请选择配置项类型')
                : `已选择（${selectData.length}）`}
            </Button>
            <TreeSelect
              showSearch
              multiple
              style={{ width: '100%', margin: '12px 0' }}
              value={selectData}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder={i18n(
                'field_value_resource_rangeSelectset',
                '请选择配置项类型后进行设置'
              )}
              allowClear
              treeDefaultExpandAll
              onChange={this.handleSelectChange}
              fieldNames={{ label: 'name', value: 'key', children: 'children' }}
              treeData={resTypeList}
            />
            <Collapse>
              {_.map(expandField, (dataSource, index) => {
                const header = _.find(names, (item) => item.code === index)
                return (
                  <Panel
                    key={index}
                    header={header ? header.name : index}
                    extra={<DeleteOutlined onClick={() => this.delResource(index)} />}
                  >
                    {_.map(dataSource, (ite, inde) => {
                      return (
                        <Row key={inde}>
                          <Col span={24} className="resource-type">
                            {ite.name}
                          </Col>
                          {_.map(ite.ciAttributeVos, (field, ind) => {
                            return (
                              <Col span={12} key={ind}>
                                <FormItem
                                  style={{ marginBottom: 0 }}
                                  {...formItemLayout}
                                  label={field.name}
                                  required={field.isRequired === 1}
                                >
                                  <Checkbox
                                    disabled={field.isRequired === 1}
                                    checked={field.isCheck}
                                    onChange={(e) => {
                                      this.changeCheck(
                                        index,
                                        inde,
                                        ind,
                                        e.target.checked,
                                        'isCheck'
                                      )
                                    }}
                                  >
                                    {i18n('watch', '查看')}
                                  </Checkbox>
                                  <Checkbox
                                    disabled={field.isRequired === 1}
                                    checked={field.isEdit}
                                    onChange={(e) => {
                                      this.changeCheck(index, inde, ind, e.target.checked, 'isEdit')
                                    }}
                                  >
                                    {i18n('edit', '编辑')}
                                  </Checkbox>
                                  <Checkbox
                                    disabled={field.isChange === 1}
                                    checked={field.isRequired}
                                    onChange={(e) => {
                                      this.changeCheck(
                                        index,
                                        inde,
                                        ind,
                                        e.target.checked,
                                        'isRequired'
                                      )
                                    }}
                                  >
                                    {i18n('conf.model.field.required', '必填')}
                                  </Checkbox>
                                </FormItem>
                              </Col>
                            )
                          })}
                        </Row>
                      )
                    })}
                  </Panel>
                )
              })}
            </Collapse>
          </div>
        </Modal>
      </>
    )
  }
}
