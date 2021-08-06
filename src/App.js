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

    // undoMove = () => {

    // }

    render() {
        return (
            <div className='center'>
                <h1>Chess App</h1>
                <div className='btn' onClick={this.togglePromotionPopup}>
                    <button>Promote</button>
                </div>
                <div className='chessboard'>
                    <WithMoveValidation togglePopup={this.togglePromotionPopup} />
                </div>
                {/* <div className='btn' onClick={this.undoMove}>
                    <button>Undo</button>
                </div> */}
                {this.state.selectPiecePromotion ? <PromotePopup togglePopup={this.togglePromotionPopup} /> : null}
            </div>
        )
    }
}

export default App
