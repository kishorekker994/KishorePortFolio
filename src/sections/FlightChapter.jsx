import PropTypes from 'prop-types';

export default function FlightChapter({ id, from, to, label, title, destination }) {
  return <section id={id} className="flight-chapter" data-flight-from={from} data-flight-to={to} aria-labelledby={`${id}-title`}>
    <div className="folio-container flight-chapter-content">
      <div className="flight-chapter-heading"><span className="folio-eyebrow">{label}</span><h2 id={`${id}-title`}>{title}</h2></div>
      <div className="flight-chapter-footer"><span>KK / FLIGHT LOG</span><span>{destination}</span></div>
    </div>
  </section>;
}

FlightChapter.propTypes = { id: PropTypes.string.isRequired, from: PropTypes.number.isRequired, to: PropTypes.number.isRequired, label: PropTypes.string.isRequired, title: PropTypes.string.isRequired, destination: PropTypes.string.isRequired };