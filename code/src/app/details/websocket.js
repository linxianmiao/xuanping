import React, { Component } from 'react'
import { notification } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'

let ws // websocket实例
class Websocket extends Component {
  componentDidMount () {
    if (this.props.isWebsocket) {
      this.webSocket()
    }
  }

    // 多人协作时，链接通信
    webSocket = () => {
      const _this = this
      // const wsUrl = 'ws://newprod.dev.cn/itsm/websocket' // 本地 联调 写死
      const wsUrl = `ws://${window.location.host}${window.location.pathname}websocket`
      const timestamp = Date.parse(new Date()) + '' + (Math.floor(Math.random() * 9000) + 1000)
      const jsonobj = {
        ticketId: _this.props.id,
        userId: runtimeStore.getState().user?.userId,
        random: timestamp
      }
      const time = 15 * 1000
      _this.setState({ random: timestamp })
      // 心跳检测
      const heartCheck = {
        timeout: time,
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function () {
          clearTimeout(this.timeoutObj)
          clearTimeout(this.serverTimeoutObj)
          return this
        },
        start: function () {
          // var self = this;
          this.timeoutObj = setTimeout(function () {
            if (ws.readyState === 3) {
              // message.warning("WebSocket未连接");
              return
            }
            // 这里发送一个心跳，后端收到后，返回一个心跳消息，
            // onmessage拿到返回的心跳就说明连接正常
            ws.send('HeartReconnect')
          }, this.timeout)
        }
      }
      function createWebSocket (url) {
        try {
          ws = new WebSocket(url)
          initEventHandle()
        } catch (e) {
          // reconnect(url);
        }
      }
      function initEventHandle () {
        ws.onclose = function () {
          // reconnect(wsUrl);
        }
        ws.onerror = function (e) {
          if (e.target.readyState === 3) {
            // message.warning("WebSocket未连接");

          }
        }
        ws.onopen = function () {
          // 心跳检测重置
          ws.send(JSON.stringify(jsonobj))
          heartCheck.reset().start()
        }
        ws.onmessage = function (data) {
          // 如果获取到消息，心跳检测重置
          // 拿到任何消息都说明当前连接是正常的
          if (data.data === 'HeartReconnect') {
            heartCheck.reset().start()
            return false
          }
          // 返回的信息
          const result = JSON.parse(data.data)
          // socketScene 0：协同   1：重试
          const { socketScene, canClick, retryResult, errorMessage, userName, message, isSelf, tacheId, caseId, chartStatus } = result
          if (Number(isSelf) !== 1) {
            const key = `open${Date.now()}`
            const args = {
              message: userName + `${message === 'join' ? i18n('ticket.conflict.join', '进入工单处理') : i18n('ticket.conflict.quit', '退出工单处理')}`,
              key
            }
            notification.info(args)
          }
          // 点击执行后给后端推送按钮点击状态
          if (_this.props.activityType === 'AutomaticDelivery') {
            _this.props.setBtnCanClick && _this.props.setBtnCanClick(canClick)
          }
          // auto接口不同是展现的错误信息
          if (socketScene === 1) {
            _this.props.setErrMes && _this.props.setErrMes(retryResult, errorMessage)
          }
          // 作业执行成功以后修改实例图的状态
          if (chartStatus === '3') {
            _this.props.setChartStatus()
          }
          if (tacheId && caseId) {
            _this.props.history.push({
              pathname: `/ticket/detail/${_this.props.id}`,
              query: { tacheId, caseId }
            })
          }
        }
      }
      createWebSocket(wsUrl)
    }

    // 自动交付节点按钮是否显示
    findAndModify = () => {
      ws.send(JSON.stringify({
        userId: runtimeStore.getState().user?.userId,
        ticketId: this.props.id
      }))
    }

    componentWillUnmount () {
      ws && ws.close()
    }

    render () {
      return (
        <div />
      )
    }
}

export default withRouter(Websocket)
