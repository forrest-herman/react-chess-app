// import React, { useState } from "react"
import "./App.css"
import Chessboard from "chessboardjsx"
// import { ChessInstance } from "chess.js"

const Chess = require("chess.js")

function App() {
    // const [chess] = useState < ChessInstance > new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    const chess = new Chess("r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - c3 0 19")

    // const [board, setBoard] = useState([])

    while (!chess.game_over()) {
        const moves = chess.moves()
        const move = moves[Math.floor(Math.random() * moves.length)]
        chess.move(move)
    }

    return (
        <div className='center'>
            <h1>Chess App</h1>
            <div className='chessboard'>
                <Chessboard width={400} position='r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - c3 0 19' />
            </div>
        </div>
    )
}

export default App
