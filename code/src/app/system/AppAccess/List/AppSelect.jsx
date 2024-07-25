import React, { Component } from 'react'
import { Button, Modal, Spin, Row, Col, Empty, Input } from '@uyun/components'
import classnames from 'classnames'
import styles from './index.module.less'

export default class AppSelect extends Component {
  static defaultProps = {
    onOk: () => {}
  }

  state = {
    visible: false,
    loading: false,
    data: [],
    currSelected: {} // 当前选中的应用
  }

  queryApps = async (kw) => {
    this.setState({ loading: true })

    const data = (await axios.get(API.queryAllApp, { params: { kw } })) || []
    this.setState({
      loading: false,
      data
    })
  }

  handleOpen = () => {
    this.setState({ visible: true })
    this.queryApps()
  }

  handleClose = () => {
    this.setState({
      visible: false,
      currSelected: {},
      data: []
    })
  }

  handleClick = (item) => {
    if (!item.isAccess && item.appCode !== this.state.currSelected.appCode) {
      this.setState({ currSelected: item })
    }
  }

  handleOk = () => {
    const { currSelected } = this.state

    this.handleClose()
    this.props.onOk(currSelected)
  }

  render() {
    const { visible, loading, data, currSelected } = this.state

    return (
      <>
        <Button type="primary" onClick={this.handleOpen}>
          {i18n('access.platform.app', '接入平台应用')}
        </Button>
        <Modal
          title={i18n('access.platform.app', '接入平台应用')}
          width={947}
          wrapClassName={styles.modalWrapper}
          visible={visible}
          destroyOnClose
          okButtonProps={{ disabled: !currSelected.appCode }}
          onCancel={this.handleClose}
          onOk={this.handleOk}
        >
          <Spin spinning={loading}>
            <Input.Search
              enterButton
              onSearch={(kw) => this.queryApps(kw)}
              style={{ width: 200, margin: '8px auto 8px' }}
            />
            <Row gutter={10} className={styles.listWrapper}>
              {data.length === 0 && <Empty type="data" />}
              {data.length > 0 &&
                data.map((item) => {
                  const isActive = item.appCode === currSelected.appCode
                  const isAccess = !!item.isAccess
                  const clsName = classnames(styles.appCard, {
                    [styles.active]: isActive,
                    [styles.selected]: isAccess
                  })
                  return (
                    <Col key={item.appCode} span={6}>
                      <div className={clsName} onClick={() => this.handleClick(item)}>
                        <img
                          src={`/tenant/styles/images/${item.appPlatformCode}.png`}
                          onError={(e) => (e.target.src = '/tenant/styles/images/cmdb-icon.png')}
                        />
                        <div>
                          <h2 title={item.appName}>{item.appName}</h2>
                          <p title={item.appDescription}>{item.appDescription}</p>
                        </div>
                        {isActive && <i className={`iconfont icon-check ${styles.active}`} />}
                        {isAccess && <i className={`iconfont icon-check ${styles.selected}`} />}
                      </div>
                    </Col>
                  )
                })}
            </Row>
          </Spin>
        </Modal>
      </>
    )
  }
}
