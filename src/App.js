import React, { Component } from "react"
import "./App.css"

import WithMoveValidation from "./integrations/WithMoveValidation"
import PromotePopup from "./elements/PromotePopup"

// import Chessboard from "chessboardjsx"
// import { ChessInstance } from "chess.js"

// const Chess = require("chess.js")

class App extends Component {
    state = {
        selectPiecePromotion: false,
    }

    togglePromotionPopup = () => {
        this.setState({ selectPiecePromotion: !this.state.selectPiecePromotion })
    }

    render() {
        return (
            <div className='center'>
                <h1>Chess App</h1>
                <div className='btn' onClick={this.togglePromotionPopup}>
                    <button>New User?</button>
                </div>
                <div className='chessboard'>
                    <WithMoveValidation togglePopup={this.togglePromotionPopup} />
                </div>
                {this.state.selectPiecePromotion ? <PromotePopup togglePopup={this.togglePromotionPopup} /> : null}
            </div>
        )
    }
}

export default App
