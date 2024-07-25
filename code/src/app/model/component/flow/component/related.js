import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import IndexStore from '../../../../trigger/store/indexStore'
import { Form, Select, Button, Dropdown, Checkbox, AutoComplete, Row, Col } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import _ from 'lodash'
const FormItem = Form.Item
const Option = Select.Option
const indexStore = new IndexStore()
@inject('flowStore')
@observer
class ArrangeItem extends Component {
  // 添加更多参数菜单
  createMenu() {
    const { arrange_parameter, checkeOptional } = this.props
    return (
      <div className="param-dropDown">
        {_.map(arrange_parameter.required, (item, index) => {
          return (
            <Checkbox key={index} checked disabled>
              {' '}
              {item.name}{' '}
            </Checkbox>
          )
        })}
        {_.map(arrange_parameter.optional, (item, index) => {
          return (
            <Checkbox
              checked={!!checkeOptional.find((optional) => optional.name === item.name)}
              onChange={this.addParameter.bind(this, item)}
              key={index}
            >
              {' '}
              {item.name}{' '}
            </Checkbox>
          )
        })}
      </div>
    )
  }

  // 选择编排参数
  selectArrange(val) {
    const { index } = this.props
    this.props.selectArrange(index, val)
  }

  // 选择编排参数value
  changeparItem(parItem, e) {
    const reg = /^\$\{(\w+)\}$/
    const value = e ?? ''
    const { dealRules, index } = this.props

    if (!dealRules[index].autoParams[parItem.name]) {
      dealRules[index].autoParams[parItem.name] = {
        required: parItem.required,
        autoType: parItem.autoType
      }
    }

    dealRules[index].autoParams[parItem.name].value = value
    dealRules[index].autoParams[parItem.name].type = reg.test(value) ? 'field' : 'text'

    this.props.getData && this.props.getData(dealRules)
    this.forceUpdate()
  }

  // 根据当前编排添加更多参数
  addParameter(ite, e) {
    const { surplusOptional, checkeOptional, arrange_parameter, dealRules, index } = this.props
    _.forEach(arrange_parameter.optional, (item) => {
      if (item.name === ite.name && e.target.checked) {
        _.pull(surplusOptional, item) // 删除剩余的参数
        checkeOptional.push(item) // 添加当前选中的参数
        // 初始化
        if (_.isEmpty(dealRules[index].autoParams)) {
          dealRules[index].autoParams = {}
        }
        dealRules[index].autoParams[item.name] = {
          value: item.value,
          type: item.value ? 'field' : 'text',
          autoType: item.autoType
        }
        return false
      }
      if (item.name === ite.name && !e.target.checked) {
        // 删除编排的参数
        delete dealRules[index].autoParams[item.name]
        // 删除以后，添加更多参数那里增加一个，列表中删除一个
        _.pull(checkeOptional, item)
        surplusOptional.push(item)
      }
    })
    this.forceUpdate()
    this.props.getData && this.props.getData(dealRules)
  }

  addOutparams = (item, e) => {
    const { checkoutparams, dealRules, index } = this.props
    if (e.target.checked) {
      checkoutparams[item.name] = {
        autoType: item.autoType
      }
    } else {
      delete checkoutparams[item.name]
    }
    dealRules[index].outputParams = checkoutparams
    this.props.getData && this.props.getData(dealRules)
    this.forceUpdate()
  }

  // 删除当前编排参数
  delParameter(parItem) {
    const { dealRules, index, surplusOptional, checkeOptional } = this.props
    // 删除编排的参数
    delete dealRules[index].autoParams[parItem.name]
    // 删除以后，添加更多参数那里增加一个，列表中删除一个
    _.pull(checkeOptional, parItem)
    surplusOptional.push(parItem)
    this.forceUpdate()
    this.props.getData && this.props.getData(dealRules)
  }

  changeType = (value) => {
    this.props.changeType(value)
  }

  handleChangeOutparams = (value, item) => {
    const { checkoutparams, dealRules, index } = this.props
    const field = _.find(item.fieldList, (field) => '${' + field.code + '}' === value) || {}
    _.forEach(checkoutparams, (val, key) => {
      if (key === item.name) {
        checkoutparams[key] = _.assign({}, val, {
          codeType: field.codeType,
          name: value,
          type: field.fieldType
        })
      }
    })
    dealRules[index].outputParams = checkoutparams
    this.props.getData && this.props.getData(dealRules)
    this.forceUpdate()
  }

  changeVersion = (value) => {
    const { dealRules, index } = this.props
    // dealRules[index].operatingVersion = value
    // this.props.getData && this.props.getData(dealRules)
    this.props.selectArrange(
      index,
      { key: dealRules[index].autoId || dealRules[index].autoCode },
      value
    )
    this.forceUpdate()
  }

  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const type = this.props.dealRules[0].autoType === 1 ? 1 : undefined
    const res =
      (await axios.get(API.get_auto_list, {
        params: { pageSize, pageNum: pageNo, key: kw, type }
      })) || {}
    const list = _.forEach(res.autoList || [], (auto) => (auto.id = auto.value || auto.code))
    callback(list)
    const { autoList } = this.props
    if (pageNo === 1) {
      this.props.getAutoList(res.autoList)
    } else {
      this.props.getAutoList([...autoList, ...res.autoList])
    }
  }

  changeJobNameSource = (d) => {
    const { dealRules, index } = this.props
    if (!_.isEmpty(d)) {
      dealRules[index].jobNameSource = {
        name: d.value,
        code: d.key
      }
    } else {
      dealRules[index].jobNameSource = {}
    }

    this.props.getData && this.props.getData(dealRules)
    this.forceUpdate()
  }

  render() {
    const {
      dealRules,
      index,
      arrange_parameter,
      checkeOptional,
      outparams,
      checkoutparams,
      releaseVersions,
      searchItem,
      optionsOfType
    } = this.props
    const requiredLen = arrange_parameter.required ? arrange_parameter.required.length : 0
    const checkeOptionallLen = checkeOptional.length || 0
    const length = requiredLen + checkeOptionallLen
    const dealRulesValue = dealRules[0]
    const isSubmit = this.props.store.isSubmit
    const checkOutItem = _.map(checkoutparams, (val, key) => key) // 输出参数选中
    const disabledOutFields = _.map(checkoutparams, (val, key) => val.name) // 输出参数禁用字段
    const autoId = dealRulesValue.autoId || dealRulesValue.autoCode

    return (
      <div className="arrange-item">
        <div />
        <div className="mb-20">
          <div>
            <Select
              style={{ marginBottom: '8px' }}
              value={dealRulesValue.autoType}
              onChange={this.changeType}
              getPopupContainer={() => document.getElementById('autoTask')}
            >
              <Option value={0}>{i18n('choreography', '编排')}</Option>
              <Option value={1}>{i18n('operation', '操作')}</Option>
              <Option value={2}>{i18n('autoOperation', '自动执行')}</Option>
            </Select>
            {dealRulesValue.autoType !== 2 && (
              <React.Fragment>
                <LazySelect
                  style={{ width: '68%' }}
                  allowClear={false}
                  value={autoId ? { key: autoId, label: dealRulesValue.autoName } : undefined}
                  onChange={(val) => {
                    this.selectArrange(val)
                  }}
                  placeholder={i18n('globe.select', '请选择')}
                  getList={this.getList}
                />
                {dealRulesValue.autoType === 1 ? (
                  <Select
                    placeholder={i18n('conf.model.process.selectVersion', '请选择操作版本')}
                    style={{ width: '29%', marginLeft: '3%' }}
                    value={dealRulesValue.operatingVersion}
                    onChange={this.changeVersion}
                    getPopupContainer={() => document.getElementById('autoTask')}
                  >
                    {_.map(releaseVersions, (release) => {
                      return (
                        <Option value={release.version} key={release.version}>
                          {release.version}
                        </Option>
                      )
                    })}
                  </Select>
                ) : null}
              </React.Fragment>
            )}
          </div>
        </div>

        <div className="required-item" style={{ lineHeight: '18px' }}>
          <i className="iconfont icon-tishi" style={{ marginRight: '5px' }} />
          {dealRulesValue.autoType !== 2 ? (
            <span className="required-item-name">
              {i18n('conf.model.proces.proxy', '操作类型不支持proxy')}
            </span>
          ) : (
            <span>
              {i18n(
                'conf.model.proces.tip1',
                '流程流转到"自动节点"后会自动提交任务，在同步并行中有判断分支的流程场景需要使用'
              )}
            </span>
          )}
        </div>
        {dealRulesValue.autoType !== 2 ? (
          <div>
            <div>{'作业名称来源'}</div>
            <FormItem>
              <Select
                labelInValue
                allowClear
                value={
                  !_.isEmpty(dealRulesValue?.jobNameSource)
                    ? {
                        label:
                          dealRulesValue?.jobNameSource?.name +
                          ' | ' +
                          dealRulesValue?.jobNameSource?.code
                      }
                    : undefined
                }
                onChange={this.changeJobNameSource}
                style={{ width: '100%' }}
                placeholder="请选择作业名称来源"
                showSearch
                filterOption={(input, option) => {
                  return (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }}
              >
                {_.map(optionsOfType, (d) => {
                  return (
                    <Option key={d.code} value={d.name} id={d.code}>
                      {d.name + ' | ' + d.code}
                    </Option>
                  )
                })}
              </Select>
            </FormItem>
          </div>
        ) : null}

        {dealRulesValue.autoType !== 2 && (
          <div>
            <h4>{i18n('conf.model.proces.autoTaskParam.enter', '入参')}</h4>
            <FormItem>
              <Dropdown overlay={this.createMenu()} trigger={['click']}>
                <Button className="paramButton" type="primary">
                  {i18n('conf.model.proces.autoTask.selected', '已选中')}
                  {'（' + length + '）'}
                  {i18n('item1', '个')}
                </Button>
              </Dropdown>
            </FormItem>
            {arrange_parameter && !_.isEmpty(arrange_parameter.required) ? (
              <FormItem>
                {_.map(arrange_parameter.required, (parItem, ind) => {
                  const parItemVal =
                    dealRules[index].autoParams[parItem.name] &&
                    dealRules[index].autoParams[parItem.name].value
                  return (
                    <div key={ind} className="parameter-item clearfix">
                      <div className="parameter-item-name" style={{ width: '150px' }}>
                        <i className="parameter-item-name-require" />
                        {parItem.name}
                      </div>
                      <i className="iconfont icon-xiayi parameter-item-jiantou" />
                      <div className="parameter-item-value" style={{ width: '150px' }}>
                        <Select
                          showSearch
                          allowClear
                          mode="tags"
                          optionFilterProp="children"
                          notFoundContent={i18n('globe.notFound', '无法找到')}
                          onChange={(value) => {
                            this.changeparItem(parItem, _.last(value))
                          }}
                          value={parItemVal || []}
                          style={{ width: '100%' }}
                          className={isSubmit && !parItemVal ? 'parameter-item-red' : ''}
                          getPopupContainer={() => document.getElementById('autoTask')}
                        >
                          {_.map(parItem.fieldList, (field, inde) => {
                            return (
                              <Option value={'${' + field.code + '}'} key={inde}>
                                {field.fieldName + ' | ' + field.code}
                              </Option>
                            )
                          })}
                        </Select>
                      </div>
                    </div>
                  )
                })}
              </FormItem>
            ) : null}
            {!_.isEmpty(checkeOptional) ? (
              <FormItem style={{ marginTop: '-6px' }}>
                {_.map(checkeOptional, (parItem, i) => {
                  const parItemVal = _.get(
                    dealRules,
                    [index, 'autoParams', parItem.name, 'value'],
                    []
                  )
                  const options = _.map(parItem.fieldList, (field) => ({
                    value: '${' + field.code + '}',
                    label: field.fieldName + ' | ' + field.code
                  }))
                  const parItemValFormatObj = _.find(options, (d) => d.value === parItemVal)
                  const parItemValFormat = parItemValFormatObj
                    ? parItemValFormatObj.label
                    : parItemVal
                  return (
                    <div key={parItem.name} className="parameter-item clearfix">
                      <div className="parameter-item-name" style={{ width: '150px' }}>
                        {parItem.name}
                      </div>
                      <i className="iconfont icon-xiayi parameter-item-jiantou" />
                      <div className="parameter-item-value" style={{ width: '150px' }}>
                        {parItem.name === 'isSendAlert' ? (
                          <Checkbox
                            checked={parItemVal}
                            onChange={(e) => {
                              this.changeparItem(parItem, e.target.checked)
                            }}
                          >
                            <span>作业任务执行异常时通过Alert进行告警</span>
                          </Checkbox>
                        ) : (
                          // <Select
                          //   showSearch
                          //   value={parItemVal}
                          //   style={{ width: '100%' }}
                          //   optionFilterProp="children"
                          //   notFoundContent={i18n('globe.notFound', '无法找到')}
                          //   onChange={(value) => this.changeparItem(parItem, value)}
                          //   onSearch={(value) => this.changeparItem(parItem, value)}
                          //   getPopupContainer={() => document.getElementById('autoTask')}
                          // >
                          //   {_.map(parItem.fieldList, (field) => (
                          //     <Option value={'${' + field.code + '}'} key={field.code}>
                          //       {field.fieldName}
                          //     </Option>
                          //   ))}
                          // </Select>
                          <AutoComplete
                            allowClear
                            value={parItemValFormat}
                            onChange={(value) => this.changeparItem(parItem, value)}
                            onSelect={(value) => this.changeparItem(parItem, value)}
                            onSearch={(value) => searchItem(value, i)}
                            getPopupContainer={() => document.getElementById('autoTask')}
                            options={options}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </FormItem>
            ) : null}
            <h4>{i18n('conf.model.proces.autoTaskParam.outer', '出参')}</h4>
            <FormItem>
              <Dropdown
                overlay={
                  <div className="param-dropDown">
                    {_.map(outparams, (item, index) => {
                      return (
                        <Checkbox
                          key={index}
                          onChange={(e) => {
                            this.addOutparams(item, e)
                          }}
                          checked={_.some(checkOutItem, (checkedItem) => checkedItem === item.name)}
                        >
                          {' '}
                          {item.name}{' '}
                        </Checkbox>
                      )
                    })}
                  </div>
                }
                trigger={['click']}
              >
                <Button className="paramButton" type="primary">
                  {i18n('conf.model.proces.autoTask.selected', '已选中')}
                  {'（' + checkOutItem.length + '）'}
                  {i18n('item1', '个')}
                </Button>
              </Dropdown>
            </FormItem>
            <FormItem>
              {_.filter(outparams, (item) => _.includes(checkOutItem, item.name)).map((item) => {
                const value = checkoutparams[item.name].name
                return (
                  <div key={item.name} className="parameter-item clearfix">
                    <div className="parameter-item-name" style={{ width: '150px' }}>
                      {item.name}
                    </div>
                    <i className="iconfont icon-xiayi parameter-item-jiantou" />
                    <div className="parameter-item-value" style={{ width: '150px' }}>
                      <Select
                        showSearch
                        optionFilterProp="children"
                        notFoundContent={i18n('globe.notFound', '无法找到')}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          this.handleChangeOutparams(value, item)
                        }}
                        value={value}
                        getPopupContainer={() => document.getElementById('autoTask')}
                      >
                        {_.map(item.fieldList, (field) => {
                          return (
                            <Option
                              disabled={_.includes(disabledOutFields, field.code)}
                              value={'${' + field.code + '}'}
                              key={field.code}
                            >
                              {field.fieldName + ' | ' + field.code}
                            </Option>
                          )
                        })}
                      </Select>
                    </div>
                  </div>
                )
              })}
            </FormItem>
            <div />
          </div>
        )}
      </div>
    )
  }
}

class related extends Component {
  static defaultProps = {
    store: indexStore
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      outparams: [],
      checkoutparams: {},
      arrange_parameter: {},
      surplusOptional: [], // 当前剩余下的编排参数
      checkeOptional: [], // 当前选中的编排参数页面实际展示用
      checkeOptionalOrigin: [], // 当前选中的编排参数 真正数据
      dealRules: props.defaultValue || [
        {
          name: 'w',
          ruleType: 2,
          type: 4,
          autoType: 0
        }
      ],
      autoList: [],
      releaseVersions: [],
      optionsOfType: []
    }
  }

  getAutoList = (autoList) => {
    this.setState({
      autoList
    })
  }

  componentDidMount() {
    const { dealRules } = this.state
    if (dealRules && (dealRules[0].autoCode || dealRules[0].autoId)) {
      const version = dealRules[0].operatingVersion || undefined
      const param = dealRules[0].autoId
        ? { autoId: dealRules[0].autoId, version }
        : { autoCode: dealRules[0].autoCode, version }
      this.getAutoParams(param, dealRules[0].autoType).then((data) => {
        this.setState({
          arrange_parameter: data.arrange_parameter,
          surplusOptional: data.surplusOptional,
          checkeOptional: data.checkeOptional,
          checkeOptionalOrigin: data.checkeOptional,
          outparams: data.outparams,
          checkoutparams: data.checkoutparams,
          releaseVersions: data.releaseVersions || []
        })
      })
    }

    // 作业名称来源下拉 模型下单行文本字段
    const params = {
      fieldTypes: 'singleRowText',
      modelId: this.props.modelId
    }
    axios.get(API.query_field_with_type, { params }).then((res) => {
      this.setState({ optionsOfType: res && res['singleRowText'] })
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      const dealRules = nextProps.defaultValue
      this.setState({
        dealRules: dealRules || [
          {
            name: 'w',
            ruleType: 2,
            type: 4,
            autoType: 0
          }
        ],
        outparams: [],
        checkoutparams: {},
        arrange_parameter: {},
        surplusOptional: [], // 当前剩余下的编排参数
        checkeOptional: [],
        checkeOptionalOrigin: []
      })
      if (dealRules && (dealRules[0].autoCode || dealRules[0].autoId)) {
        const version = dealRules[0].operatingVersion || undefined
        const param = dealRules[0].autoId
          ? { autoId: dealRules[0].autoId, version }
          : { autoCode: dealRules[0].autoCode, version }
        this.getAutoParams(param, dealRules[0].autoType).then((data) => {
          this.setState({
            arrange_parameter: data.arrange_parameter,
            surplusOptional: data.surplusOptional,
            checkeOptional: data.checkeOptional,
            checkeOptionalOrigin: data.checkeOptional,
            outparams: data.outparams,
            checkoutparams: data.checkoutparams,
            releaseVersions: data.releaseVersions || []
          })
        })
      }
    }
  }

  changeType = (value) => {
    const { dealRules } = this.state
    dealRules[0].autoType = value
    dealRules[0].autoCode = ''
    dealRules[0].autoId = ''
    dealRules[0].autoName = ''
    dealRules[0].operatingVersion = undefined
    dealRules[0].autoParams = {}
    dealRules[0].outputParams = {}
    dealRules[0].jobNameSource = {}
    this.setState({
      arrange_parameter: [],
      checkoutparams: {}
    })
    this.getData(dealRules)
  }

  // 选择编排选择编排
  selectArrange = (index = 0, val, version) => {
    version = version || undefined
    const item =
      _.find(this.state.autoList, (list) => list.value === val.key || list.code === val.key) || {}
    const { dealRules } = this.state
    dealRules[index].autoCode = item.code
    dealRules[index].autoId = item.value
    dealRules[index].autoName = item.name
    dealRules[index].operatingVersion = version || ''
    dealRules[index].sensitiveAuthor = []
    const param = item.value ? { autoId: item.value, version } : { autoCode: item.code, version }
    !_.isEmpty(item) &&
      this.getAutoParams(param, dealRules[0].autoType).then((data) => {
        // 选择新的编排的时候以前的参数清空并且进行数据初始化
        dealRules[index].autoParams = {}
        dealRules[index].outputParams = {}
        // dealRules[index].autoName = data.name
        dealRules[index].needWaitWhenExecuteException = data.needWaitWhenExecuteException
        dealRules[index].executionTime = { selectType: 'value' }
        _.map(data.data, (requireItem) => {
          dealRules[index].autoParams[requireItem.name] = {
            value: requireItem.value,
            type: requireItem.value ? 'text' : 'field',
            autoType: requireItem.autoType,
            required: 1
          }
          // gz 要求加的参数，不知道干啥用的
          if (requireItem.isEquipmentPerspective === 1) {
            dealRules[index].autoParams[requireItem.name].isEquipmentPerspective = 1
          }
        })
        this.setState({
          arrange_parameter: data.arrange_parameter,
          surplusOptional: data.surplusOptional,
          checkeOptional: data.checkeOptional,
          checkeOptionalOrigin: data.checkeOptional,
          outparams: data.outparams,
          checkoutparams: {},
          releaseVersions: item.release_versions || []
        })
        this.getData(dealRules)
      })
    this.getData(dealRules)
  }

  // 获取当前编排的参数
  getAutoParams(data, type) {
    return new Promise((resolve) => {
      axios
        .get(API.get_auto_params, {
          params: {
            ...data,
            modelId: this.context.modelId,
            type: type == '1' ? 1 : 0
          }
        })
        .then((res) => {
          this.props.store.setAutoTaskParams(this.props.id, res)
          const { dealRules } = this.state
          let surplusOptional = res.optional
          let checkeOptional = []
          let checkoutparams = {}
          _.forEach(dealRules, (rule) => {
            // rule.autoName = res.name
            if (rule.autoCode === data.autoCode || rule.autoId === data.autoId) {
              const keys = _.keys(rule.autoParams)
              // 已经选中的编排参数
              checkeOptional = _.filter(res.optional, (item) => {
                return keys.indexOf(item.name) !== -1
              })
              // 剩余可选的编排参数
              surplusOptional = _.filter(res.optional, (item) => {
                return keys.indexOf(item.name) === -1
              })
              checkoutparams = rule.outputParams || {}
              return false
            }
          })
          // 重新切换编排的时候要对必选的编排参数进行初始化
          resolve({
            data: res.required,
            arrange_parameter: res,
            surplusOptional,
            checkeOptional,
            checkoutparams,
            outparams: res.outparams,
            releaseVersions: res.release_versions || []
          })
        })
    })
  }

  getData = (dealRules) => {
    this.setState({
      dealRules: dealRules
    })
    this.props.getData && this.props.getData(dealRules)
  }

  searchItem = (value, i) => {
    const { checkeOptionalOrigin } = this.state
    const checkeOptionalP = _.cloneDeep(checkeOptionalOrigin)
    const options = checkeOptionalP[i].fieldList
    let res = []
    if (value && _.some(options, (d) => _.includes(d.fieldName, value))) {
      res = _.filter(options, (d) => _.includes(d.fieldName, value))
    } else {
      res = []
    }
    checkeOptionalP[i].fieldList = res
    this.setState({ checkeOptional: checkeOptionalP })
  }

  render() {
    const { store } = this.props
    const {
      dealRules,
      arrange_parameter,
      surplusOptional,
      checkeOptional,
      outparams,
      checkoutparams,
      autoList,
      releaseVersions,
      optionsOfType
    } = this.state
    return (
      <div id="proSetField">
        <ArrangeItem
          index={0}
          store={store}
          autoList={autoList}
          dealRules={dealRules}
          checkeOptional={checkeOptional}
          searchItem={this.searchItem}
          checkoutparams={checkoutparams}
          surplusOptional={surplusOptional}
          arrange_parameter={arrange_parameter}
          releaseVersions={releaseVersions}
          outparams={outparams}
          selectArrange={this.selectArrange}
          getData={this.getData}
          changeType={this.changeType}
          getAutoList={this.getAutoList}
          optionsOfType={optionsOfType}
        />
      </div>
    )
  }
}

export default related
