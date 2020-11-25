import { connect } from 'react-redux';

import Excerpt from '../preview/Excerpt';
import { fromPublicationPreview } from '../selectors';

const mapStateToProps = (state, { fields }) => ({
    lines: fromPublicationPreview.getPublicationPreview(state),
    columns: fields,
});

export default connect(mapStateToProps)(Excerpt);
