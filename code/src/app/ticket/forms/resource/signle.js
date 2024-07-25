import React, { Component } from 'react'
import classnames from 'classnames'
import { toJS } from 'mobx'
import { Tag, Button, message, Select } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import { inject, observer } from 'mobx-react'
import CIPicker, { ClassPicker } from '@uyun/ec-ci-picker'
@inject('resourceStore')
@observer
class SignleResource extends Component {
  constructor(props) {
    super(props)
    let queryItems = {
      name: {
        value: [],
        queryOperator: 'CONTAIN_CI',
        dataType: 'singleRowText'
      }
    }
    const resType = this.props.field.resType ? toJS(this.props.field.resType) : []
    if (!_.isEmpty(resType)) {
      queryItems['classCode'] = {
        value: _.map(resType, (d) => d.value),
        dataType: 'classCode',
        queryOprerator: 'EQ'
      }
    }

    this.state = {
      list: [],
      total: 0,
      type: props.field.useScene.relation.type ? 'relation' : 'increased',
      cis: {
        queryItems,
        page_index: 1,
        page_size: 10,
        name: undefined
      },
      loading: false,
      classList: [],
      queryItems: queryItems
    }
  }

  queryAllResType = (e) => {
    const { permission } = this.props
    if (!permission) {
      message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
      e.stopPropagation()
      return
    }
    const resType = this.props.field.resType ? toJS(this.props.field.resType) : []
    if (resType.length === 1) {
      //下拉类型的配置项选了资源类型时
      const resType = toJS(this.props.field.resType)
      const codes = _.map(resType, (d) => d.key)
      let queryItems = _.cloneDeep(this.state.queryItems)
      if (!_.isEmpty(resType)) {
        queryItems['classCode'] = {
          value: codes,
          dataType: 'classCode',
          queryOprerator: 'EQ'
        }
      }
      this.setState({ queryItems })
      return false
    } else {
      //下拉类型的配置项没有选资源类型时
      const { resType, type, attributeValues, checkEditPermission } = this.props.field

      this.setState({ loading: true })
      this.props.resourceStore
        .queryAllResType({
          formType: this.props.field.type === 'resource' ? 'CMDB' : 'ASSET',
          checkEditPermission
        })
        .then((classList) => {
          const queryItems = _.cloneDeep(this.state.queryItems)
          _.forEach(attributeValues, (item) => {
            queryItems[item.code] = {
              value: [].concat(item.value),
              queryOperator: [].concat(item.value).length === 1 ? 'EQ' : 'IN',
              disabled: true
            }
          })
          this.setState({
            classList,
            queryItems,
            loading: false
          })
        })
    }
  }

  handleClick = (item) => {
    const select = [].concat(item)
    this.props.handleOk(select)
    this.setTopologyBase(item)
  }

  // 根据配置项获取有没有关联的架构图
  setTopologyBase = (item) => {
    const { field, forms, sandboxId } = this.props
    if (this.props.field.bindChartFields) {
      this.props.resourceStore
        .getChartUrl({
          appId: item.id,
          sandboxId: sandboxId,
          resourceCode: field.code,
          modelId: forms.modelId,
          tacheId: forms.tacheId,
          caseId: forms.caseId,
          ticketId: forms.ticketId
        })
        .then((res) => {
          _.forEach(res, (item) => {
            if (item.resChartRelationVos) {
              this.props.setFieldsValue({
                [item.topologyCode]: [_.assign({}, item.resChartRelationVos, { chartStatus: '4' })]
              })
            }
          })
        })
    }
  }

  handleLazyLoad = () => {
    const cis = _.assign({}, this.state.cis, { page_index: this.state.cis.page_index + 1 })
    this.getCis(cis).then((res) => {
      const list = res.dataList || []
      this.setState({
        list: [].concat(this.state.list, list),
        total: res.totalRecords < 0 ? 0 : res.totalRecords,
        cis
      })
    })
  }

  getCis = async (cis) => {
    const res = await this.props.getCis(cis)
    return res
  }

  handleChangeRadio = (e) => {
    this.setState({ type: e.target.value })
  }

  // 当配置项移除的时候，如果有关联的资源图，同时删除资源图
  delRow = (idx, item) => {
    const { field, getFieldValue, forms } = this.props
    if (field.bindChartFields) {
      const taskIds = []
      _.forEach(field.bindChartFields, (chart) => {
        const chartField = getFieldValue(chart)
        if (!_.isEmpty(chartField)) {
          this.props.setFieldsValue && this.props.setFieldsValue({ [chart]: undefined })
          if (chartField[0].taskId) {
            taskIds.push(chartField[0].taskId)
          }
        }
      })
      if (!_.isEmpty(taskIds)) {
        this.props.resourceStore.removeRelateResource(taskIds, forms.ticketId)
        this.props.resourceStore.topologyBase = []
      }
    }
    this.props.delRow(idx, item)
  }

  onChange = ([selectedRow, relationSelectedRow, appSelectedRow]) => {
    // 无id的数据加上关联的数据
    const merged = (this.props.value || []).filter((item) => !item.id).concat(selectedRow)
    const data = _.map(merged, (row) => {
      const delKeys = _.chain(row)
        .keys()
        .filter((item) => item.indexOf('.') !== -1)
        .value()
      return _.omit(row, delKeys)
    })
    this.props.handleOk(data)
  }

  tagRender = (props, data) => {
    const { field, disabled, permission } = this.props
    const { isRequired } = field
    const { label, value, closable, onClose } = props
    let d = {},
      index
    if (!_.isEmpty(data)) {
      d = _.find(data, (dd) => dd.id === value)
      index = _.findIndex(data, (dd) => dd.id === value)
    }
    // 从CMDB已删除或者已生效的配置项，无权限或者禁用的状态无法操作
    let isClosable =
      !(_.includes(['2', '7'], d.status) || !permission || disabled || isRequired === 2) && closable
    return (
      <Tag
        closable={isClosable}
        onClose={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onClose()
          this.delRow(index, d)
        }}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          !_.includes(['7'], d.status) && this.props.showCMDB(d)
        }}
        className={classnames({
          'resource-show-cmdb-tag': !_.includes(['7'], d.status),
          'resource-show-cmdb-tag-disabled': isRequired === 2 && !disabled
        })}
      >
        <span className="tag-label" style={{ width: isClosable ? 'calc(100% - 20px)' : '100%' }}>
          {label}
        </span>
      </Tag>
    )
  }

  render() {
    const { field, value, disabled, sandboxData } = this.props
    const { classList, queryItems } = this.state
    // const isClick = window.location.hash.indexOf('conf/newModel') === -1
    const { formType, checkEditPermission, code, isRequired, resType } = field
    const data = _.isEmpty(toJS(value)) ? sandboxData : toJS(value)
    const content = [
      <ClassPicker
        key="CLASS"
        fetchRepoClass={false}
        classList={classList}
        formType={formType}
        queryItems={queryItems}
        showClassTree={_.isEmpty(field.resType) ? true : false}
        // selectedRow={value || []}
        // 不能传入无id的数据，否则勾选时无id的数据会被过滤掉
        selectedRow={(value || []).filter((item) => !!item.id)}
        selectedType={field.multiple === '0' ? 'radio' : 'checkbox'}
        extraQueryParams={{ returnTextValue: true }}
      />
    ]
    return (
      <div className="ticket-resourse-signle-resourse-wrap">
        {/* {_.isEmpty(data) && (
          <div className="ticket-resource-signle-operating">
             {field.useScene.increased.type &&
              field.useScene.relation.type &&
              !disabled &&
              isRequired !== 2 && (
                <Radio.Group
                  size="large"
                  className="ticket-resource-signle-operating-btns"
                  onChange={this.handleChangeRadio}
                  value={type}
                >
                  <Radio.Button value="relation">
                    {field.useScene.relation.value || i18n('field_value_resource_tip0', '关联')}
                  </Radio.Button>
                  <Radio.Button value="increased">
                    {field.useScene.increased.value || i18n('field_value_assets_tip1', '新增')}
                  </Radio.Button>
                </Radio.Group>
              )}
            {type === 'increased' && field.useScene.increased.type && (
              <Button
                disabled={disabled}
                onClick={() => {
                  isClick && this.props.handleBtnClick('new')
                }}
                className="ticket-resource-signle-increased-btn"
              >
                <PlusOutlined />
                {field.useScene.increased.value || i18n('field_value_assets_tip1', '新增')}
              </Button>
            )}
          </div>
        )} */}

        {disabled ? (
          !_.isEmpty(data) ? (
            _.map(data, (d) =>
              this.tagRender(
                { label: d.name, value: d.id, closable: false, onClose: () => {} },
                data
              )
            )
          ) : (
            '--'
          )
        ) : (
          <div className="flat-cmdb-wrap">
            <Select
              mode="multiple"
              tagRender={(e) => this.tagRender(e, _.cloneDeep(data))}
              open={false}
              disabled={isRequired === 2}
              style={{
                width: '100%'
              }}
              placeholder={isRequired === 2 ? '' : i18n('globe.select', '请选择')}
              value={_.map(_.cloneDeep(data), (d) => d.id)}
              options={_.map(_.cloneDeep(data), (d) => {
                return {
                  ...d,
                  label: d.name,
                  value: d.id
                }
              })}
            />
            <CIPicker
              onChange={this.onChange}
              checkEditPermission={checkEditPermission}
              content={_.isEmpty(resType) ? (!_.isEmpty(classList) ? content : null) : content}
              fetchRepoClass={_.isEmpty(resType) ? !!_.isEmpty(classList) : undefined}
            >
              <Button
                disabled={isRequired === 2}
                icon={<PlusOutlined />}
                onClick={(e) => {
                  const conditions = _.cloneDeep(
                    JSON.parse(
                      window.sessionStorage.getItem(
                        `resourceCondition-${this.props.forms?.ticketId || undefined}`
                      )
                    )
                  )
                  const list = this.props.form.getFieldsValue()
                  let condition = {}
                  _.forEach(conditions, (item) => {
                    if (item.code === code) {
                      condition = item.param
                    }
                  })
                  const QueryItems = _.cloneDeep(queryItems)
                  if (!_.isEmpty(condition)) {
                    _.forIn(condition, (value, key) => {
                      let data = list[key]
                      if (!Array.isArray(data)) {
                        data = !_.isEmpty(list[key]) ? list[key].split(',') : []
                      }
                      QueryItems[value.code] = {
                        value: data,
                        ...condition[key],
                        queryOperator: condition[key]?.queryOperator || 'EQ'
                      }
                    })
                  }
                  this.setState({ queryItems: QueryItems }, () => {
                    this.queryAllResType(e)
                  })
                }}
              ></Button>
              {/* <Button
                  disabled={isRequired === 2}
                  onClick={(e) => {
                    const conditions = _.cloneDeep(
                      JSON.parse(
                        window.sessionStorage.getItem(
                          `resourceCondition-${this.props.forms?.ticketId || undefined}`
                        )
                      )
                    )
                    const list = this.props.form.getFieldsValue()
                    let condition = {}
                    _.forEach(conditions, (item) => {
                      if (item.code === code) {
                        condition = item.param
                      }
                    })
                    const QueryItems = _.cloneDeep(queryItems)
                    if (!_.isEmpty(condition)) {
                      _.forIn(condition, (value, key) => {
                        let data = list[key]
                        if (!Array.isArray(data)) {
                          data = !_.isEmpty(list[key]) ? list[key].split(',') : []
                        }
                        QueryItems[value.code] = {
                          value: data,
                          ...condition[key],
                          queryOperator: condition[key]?.queryOperator || 'EQ'
                        }
                      })
                    }
                    this.setState({ queryItems: QueryItems })
                    this.queryAllResType(e)
                  }}
                >
                  {i18n('select', '选择')}
                </Button> */}
            </CIPicker>
          </div>
        )}

        {/* {!_.isEmpty(data) &&
          data.map((d) => {
            return (
              <div className="ticket-resourse-signle-resourse-tag">
                <div className="ticket-resourse-signle-resourse-tag-item">
                  <span
                    className={classnames({
                      'resource-show-cmdb-item': !_.includes(['7'], d.status)
                    })}
                    onClick={() => {
                      !_.includes(['7'], d.status) && this.props.showCMDB(d)
                    }}
                  >
                    {d.name}
                  </span>
                  {!(
                    _.includes(['2', '7'], d.status) ||
                    !permission ||
                    disabled ||
                    isRequired === 2
                  ) &&
                    field.useScene.edit.type && (
                      <i
                        className="iconfont icon-bianji"
                        onClick={() => {
                          this.props.editRow(0, d)
                        }}
                      />
                    )}
                  {
                    // 从CMDB已删除或者已生效的配置项，无权限或者禁用的状态无法操作
                    !(
                      _.includes(['2', '7'], d.status) ||
                      !permission ||
                      disabled ||
                      isRequired === 2
                    ) && (
                      <i
                        className="iconfont icon-guanbi1"
                        onClick={() => {
                          this.delRow(0, d)
                        }}
                      />
                    )
                  }
                </div>
              </div>
            )
          })} */}
      </div>
    )
  }
}
export default SignleResource
