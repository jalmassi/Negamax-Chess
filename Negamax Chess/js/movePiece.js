function ClearPiece(sq) {

	var pce = game.pieces[sq];
	var col = pieceCol(pce);
	var index;
	var temp_pceNum = -1; //for debug

	pieceHash(pce, sq);

	game.pieces[sq] = PIECES.EMPTY;
	game.material[col] -= PieceVal[pce];

	for(index = 0; index < game.pceNum[pce]; ++index) {
		if(game.pList[pieceIndex(pce,index)] == sq) {
			temp_pceNum = index; //temp gets index of cleared piece
			break;
		}
	}

    game.pceNum[pce]--;
    //gets last instance of piece type and overwrites temp piece with it
	game.pList[pieceIndex(pce, temp_pceNum)] = game.pList[pieceIndex(pce, game.pceNum[pce])];

}

function AddPiece(sq, pce) {

	var col = pieceCol(pce);

	pieceHash(pce, sq);

	game.pieces[sq] = pce;
	game.material[col] += PieceVal[pce];
	game.pList[pieceIndex(pce, game.pceNum[pce])] = sq;
	game.pceNum[pce]++;

}

function MovePiece(from, to) {

	var index = 0;
	var pce = game.pieces[from];

	pieceHash(pce, from); //remove old position from hash
	game.pieces[from] = PIECES.EMPTY;

	pieceHash(pce,to);   //add new position to hash
	game.pieces[to] = pce;

	for(index = 0; index < game.pceNum[pce]; ++index) {
		if(game.pList[pieceIndex(pce,index)] == from) {
			game.pList[pieceIndex(pce,index)] = to;
			break;
		}
	}

}

function MakeMove(move) {

	var from = fromSq(move);
    var to = toSq(move);
    var side = game.side;

	game.history[game.hisPly].posKey = game.posKey;

	if( (move & MFLAGEP)) {//removes pawn with en passant
		if(side == COLOURS.WHITE) {
			ClearPiece(to-10);
		} else {
			ClearPiece(to+10);
		}
	} else if( (move & MFLAGCA)) {//castling - moves rook
		switch(to) {
			case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
			break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
			break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
			break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
			break;
            default: break;
		}
	}

    if(game.enPas != SQUARES.NO_SQ) HASH_EP();

	HASH_CA(); //hashing out old castlePerm

	game.history[game.hisPly].move = move;
    game.history[game.hisPly].fiftyMove = game.fiftyMove;
    game.history[game.hisPly].enPas = game.enPas;
    game.history[game.hisPly].castlePerm = game.castlePerm;

    game.castlePerm &= getCastlePerm(from);
    game.castlePerm &= getCastlePerm(to);
    console.log(game.castlePerm);
    game.enPas = SQUARES.NO_SQ;

    HASH_CA(); //hashing in new castlePerm

    var captured = capturedP(move);
    game.fiftyMove++;

    if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        game.fiftyMove = 0;
    }

    game.hisPly++;
	game.ply++;

	if(piecePawn(game.pieces[from])) {
        game.fiftyMove = 0;
        if( (move & MFLAGPS)) {
            if(side==COLOURS.WHITE) {
                game.enPas=from+10;
            } else {
                game.enPas=from-10;
            }
            HASH_EP();
        }
    }

    MovePiece(from, to);

    var prPce = promotedP(move);
    if(prPce != PIECES.EMPTY)   {
        ClearPiece(to);
        AddPiece(to, prPce);
    }

    game.side ^= 1;
    HASH_SIDE();

    if(SqAttacked(game.pList[pieceIndex(Kings[side],0)], game.side))  { //king can't still be checked after your move
        TakeMove();
    	return BOOL.FALSE;
    }

    return BOOL.TRUE;
}

function TakeMove() {

	game.hisPly--;
    game.ply--;

    var move = game.history[game.hisPly].move;
	var from = fromSq(move);
    var to = toSq(move);

    if(game.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    game.castlePerm = game.history[game.hisPly].castlePerm;
    game.fiftyMove = game.history[game.hisPly].fiftyMove;
    game.enPas = game.history[game.hisPly].enPas;

    if(game.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    game.side ^= 1;
    HASH_SIDE();

    if( (MFLAGEP & move)) { //re-add pawn from en passant
        if(game.side == COLOURS.WHITE) {
            AddPiece(to-10, PIECES.bP);
        } else {
            AddPiece(to+10, PIECES.wP);
        }
    } else if( (MFLAGCA & move) != 0) {
        switch(to) {
        	case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }

    MovePiece(to, from);

    var captured = capturedP(move);
    if(captured != PIECES.EMPTY) {
        AddPiece(to, captured);
    }

    if(promotedP(move) != PIECES.EMPTY)   {
        ClearPiece(from); //b/c movePiece already took back piece move
        AddPiece(from, (pieceCol(promotedP(move)) == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }

}
