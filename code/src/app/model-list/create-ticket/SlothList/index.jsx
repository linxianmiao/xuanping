import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { withRuntime, reload } from '@uyun/runtime-react'
import { Modal, message, Input } from '@uyun/components'
import Categories from './Categories'
import Sloths from './Sloths'
import confirm from '../confirm'
import styles from './index.module.less'

function parseCookieParams(url, extraParams = {}) {
  const all = document.cookie
  if (!all) return url
  const cookie = all.split(/;\s*/).reduce((acc, item) => {
    const [key, value] = item.split('=')
    acc[key] = value
    return acc
  }, {})
  const params = { ...extraParams, ...cookie }
  return url.replace(/\${(\w+)}/g, (match, group) =>
    typeof params[group] === 'undefined' ? match : params[group]
  )
}

@withRuntime((state) => ({ runtime: state }))
@inject('globalStore')
@withRouter
@observer
class Sloth extends Component {
  static defaultProps = {
    mode: 'link',
    selectList: [],
    showFollow: true,
    handleChange: () => {},
    handleChangeSelectList: () => {},
    kwAll: '',
    kw: ''
  }

  state = {
    categories: [], // 服务类型列表数据
    sloths: [], // 服务列表数据
    slothsLoading: false,
    categoryKey: 'collect'
  }

  componentDidMount() {
    this.queryCategories()
  }

  queryCategories = async () => {
    const res = await axios.get(API.query_srvcats)

    this.setState({ categories: res || [] }, () => {
      this.querySloths()
    })
  }

  querySloths = async (all) => {
    this.setState({ slothsLoading: true })

    const { categoryKey, kw, kwAll } = this.state
    const params = {
      permission_check: '1',
      id: categoryKey === 'collect' ? undefined : categoryKey,
      isCollect: categoryKey === 'collect' ? 1 : 0,
      kw: all ? kwAll : kw
    }
    const res = await axios.get(API.SERVICEITEMS_BY_CATLOG, { params })

    this.setState({ sloths: res || [], slothsLoading: false })
  }

  handleFiltersChange = (kw) => {
    this.setState({ categoryKey: undefined, kwAll: kw }, () => this.querySloths('all'))
  }

  handleClick = async (item) => {
    const { mode, selectList, handleChangeSelectList } = this.props
    if (mode === 'link') {
      const params = { id: item.time_policy_id }
      const res = await axios.get(API.CHECK_IN_TIME, { params })
      if (!res) {
        Modal.confirm({
          title: i18n('ticket.create.server.tip', '该服务不在工作时间内，是否继续?'),
          iconType: 'exclamation',
          onOk: () => {
            this.handleSkip(item)
          },
          onCancel() {}
        })
      } else {
        this.handleSkip(item)
      }
    } else {
      if (_.some(selectList, (data) => data.id === item.id)) {
        handleChangeSelectList(_.filter(selectList, (data) => data.id !== item.id))
      } else {
        handleChangeSelectList([...selectList, _.assign({}, item, { type: 'srvcat' })])
      }
    }
  }

  handleSkip = (data) => {
    const { service_model, id, content, name } = data
    this.props.handleChange(false)
    if (service_model === 1 || service_model === 2) {
      this.props.history.push(`/ticket/createService/${id}`)
    }
    if (service_model === 3) {
      const { url, relative, beforeUrl, url_target } = JSON.parse(content)
      let fullyUrl = ''
      if (+relative === 1) {
        fullyUrl = window.location.origin + url
      } else {
        if (beforeUrl) {
          fullyUrl = beforeUrl + url
        } else {
          fullyUrl = relative + url
        }
      }

      // 若是外部链接，则把 ${token} 字符串，替换成登录的token
      fullyUrl = parseCookieParams(fullyUrl, { token: this.props.globalStore.token })

      if (+url_target === 1) {
        if (this.props.runtime.inPortal) {
          reload(fullyUrl)
        } else {
          window.location.href = fullyUrl
        }
      } else {
        window.open(fullyUrl)
      }
    }
    if (service_model === 4) {
      const { richText } = JSON.parse(content) || {}
      confirm({
        title: name,
        content: <div dangerouslySetInnerHTML={{ __html: richText || '' }} />
      })
    }
  }

  handleCollect = (collect, item) => {
    const params = {
      id: item.id,
      status: collect
    }
    return axios.get(API.collectSloth, { params }).then((res) => {
      if (res === '200') {
        const msg = collect === 1 ? i18n('collect.success') : i18n('collect.cancel.success')
        message.success(msg)

        // 在“我的收藏”中取消收藏，则把该条数据在前端过滤掉
        if (this.state.categoryKey === 'collect') {
          this.setState((prevState) => {
            return {
              sloths: prevState.sloths.filter((d) => d.id !== item.id)
            }
          })
        }

        return res
      }
    })
  }

  render() {
    const { categories, sloths, slothsLoading, categoryKey, kwAll, kw } = this.state
    const { mode, selectList, showFollow } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.leftWrapper}>
          <div style={{ padding: 10 }}>
            <Input.Search
              style={{ width: '100%' }}
              placeholder={i18n('input_keyword')}
              value={kwAll}
              onChange={(e) => this.setState({ kwAll: e.target.value })}
              allowClear
              onSearch={(value) => this.handleFiltersChange(value)}
              onClear={() => {
                this.handleFiltersChange('')
              }}
            />
          </div>
          <Categories
            showFollow={showFollow}
            categoryKey={categoryKey}
            data={categories}
            onSelect={(key) =>
              this.setState({ categoryKey: key, kw: '', kwAll: '' }, this.querySloths)
            }
          />
        </div>
        <div className={styles.rightWrapper}>
          <Sloths
            categoryKey={categoryKey}
            onSearch={(val) => {
              this.setState({ kw: val }, this.querySloths)
            }}
            onChange={(e) => this.setState({ kw: e.target.value })}
            value={kw}
            showFollow={showFollow}
            mode={mode}
            selectList={selectList}
            data={sloths}
            loading={slothsLoading}
            onClick={this.handleClick}
            onCollect={this.handleCollect}
          />
        </div>
      </div>
    )
  }
}

export default Sloth
