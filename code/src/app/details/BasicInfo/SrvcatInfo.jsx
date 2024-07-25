import React from 'react'
import moment from 'moment'
import { Row, Col, Tooltip, Divider, Tag } from '@uyun/components'

export default function SrvcatInfo(props) {
  const { serviceData } = props
  const { res_persons, srvitem_name, srvitem_desc, update_time } = serviceData || {}

  function _renderTitle (item, index) {
    if (index < 2) {
      const { userName, userEmail, mobile } = item
      return (
        <p>
          {userName} :  {_.compact([userEmail, mobile]).join('|')}
        </p>
      )
    }
    return (
      <React.Fragment key={item.userId}>
        {_.map(_.slice(res_persons, 2), item => (
          <div key={item.userId}>
            <i className="iconfont icon-idcard iClass" />
            {item.userName} :  {_.compact([item.userEmail, item.mobile]).join(' | ')}
          </div>
        ))}
      </React.Fragment>
    )
  }
  if (_.isEmpty(serviceData)) return null
  return (
    <React.Fragment>
      <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      <Row className="detail-looks-sheet">
        <Col span={6}><span className="detail-looks-sheet-label">{i18n('ticket.list.source', '工单来源')}：</span>
          <div className="detail-looks-sheet-content">
            {i18n('portal', '服务门户')}
          </div>
        </Col>
        <Col span={6}><span className="detail-looks-sheet-label">{i18n('srvitem-name', '服务项名称')}：</span>
          <div className="detail-looks-sheet-content" title={srvitem_name}>
            {srvitem_name}
            {
              srvitem_desc &&
              <Tooltip placement="bottomLeft" title={srvitem_desc}>
                <i className="icon-jinggao iconfont" />
              </Tooltip>
            }
          </div>
        </Col>
        <Col span={6}><span className="detail-looks-sheet-label">{i18n('change_time', '修改时间')}：</span>
          <div className="detail-looks-sheet-content">
            {moment(update_time).format('YYYY-MM-DD HH:mm')}
          </div>
        </Col>
        <Col span={6}><span className="detail-looks-sheet-label">{i18n('responsible', '责任人')}：</span>
          <div className="detail-looks-sheet-content" style={{ whiteSpace: 'normal' }}>
            {_.map(_.take(res_persons, 3), (item, index) => (
              <Tooltip key={item.userId} placement="bottomRight" title={_renderTitle(item, index)}>
                <Tag>{index < 2 ? item.userName : '...'}</Tag>
              </Tooltip>
            ))}
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}