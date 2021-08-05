import React, { Component } from "react"

export default class PromotePopup extends Component {
    // handleClick = () => {
    //     this.props.togglePopup()
    // }
    render() {
        return (
            <div className='modal'>
                <div className='modal_content'>
                    <span className='close' onClick={this.props.togglePopup}>
                        &times;{" "}
                    </span>
                    <p>Promote your pawn:</p>
                    <button>Queen</button>
                    <button>Rook</button>
                    <button>Bishop</button>
                    <button>Knight</button>
                </div>
            </div>
        )
    }
}
