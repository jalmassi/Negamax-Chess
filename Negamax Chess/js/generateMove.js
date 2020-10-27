function MoveExists(move) {

	GenerateMoves();

	var index;
	var moveFound = NOMOVE;
	for(index = game.moveListStart[game.ply]; index < game.moveListStart[game.ply + 1]; ++index) {

		moveFound = game.moveList[index];
		if(!MakeMove(moveFound)) { //is found move legal
			continue;
		}
		TakeMove();
		if(move == moveFound) {
			return BOOL.TRUE;
		}
	}
	return BOOL.FALSE;
}

function MOVE(from, to, captured, promoted, flag) {
	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function AddCaptureMove(move) {
	game.moveList[game.moveListStart[game.ply+1]] = move;
	game.moveScores[game.moveListStart[game.ply+1]++] =
		mostLeastValueScores[capturedP(move) * 14 + game.pieces[fromSq(move)]] + 1000000;
}

function AddQuietMove(move) {
	game.moveList[game.moveListStart[game.ply+1]] = move;
	game.moveScores[game.moveListStart[game.ply+1]] =  0;

	if(move == game.killerMoves[game.ply]) {
		game.moveScores[game.moveListStart[game.ply+1]] = 900000;
	} else if(move == game.killerMoves[game.ply + MAXDEPTH]) {
		game.moveScores[game.moveListStart[game.ply+1]] = 800000;
	} else {
		game.moveScores[game.moveListStart[game.ply+1]] =
			game.searchHistory[game.pieces[fromSq(move)] * BRD_SQ_NUM + toSq(move)];
	}

	game.moveListStart[game.ply+1]++
}

function AddEnPassantMove(move) {
	game.moveList[game.moveListStart[game.ply+1]] = move;
	game.moveScores[game.moveListStart[game.ply + 1]++] = 105 + 1000000;
}

function AddWhitePawnCaptureMove(from, to, cap) {
	if(RanksBrd[from]==RANKS.RANK_7) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}

function AddBlackPawnCaptureMove(from, to, cap) {
	if(RanksBrd[from]==RANKS.RANK_2) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}

function AddWhitePawnQuietMove(from, to) {
	if(RanksBrd[from]==RANKS.RANK_7) {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wQ,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wR,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wB,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wN,0));
	} else {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));
	}
}

function AddBlackPawnQuietMove(from, to) {
	if(RanksBrd[from]==RANKS.RANK_2) {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bQ,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bR,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bB,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bN,0));
	} else {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));
	}
}

function GenerateMoves() {
	game.moveListStart[game.ply+1] = game.moveListStart[game.ply];

	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;

	if(game.side == COLOURS.WHITE) {
		pceType = PIECES.wP;

		for(pceNum = 0; pceNum < game.pceNum[pceType]; ++pceNum) {
			sq = game.pList[pieceIndex(pceType, pceNum)];
			if(game.pieces[sq + 10] == PIECES.EMPTY) {
				AddWhitePawnQuietMove(sq, sq+10);
				if(RanksBrd[sq] == RANKS.RANK_2 && game.pieces[sq + 20] == PIECES.EMPTY) {
					AddQuietMove( MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS ));
				}
			}

			// white pawn capture
			if(!sqOffBoard(sq + 9) && pieceCol(game.pieces[sq+9]) == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, game.pieces[sq+9]);
			}
			if(!sqOffBoard(sq + 11) && pieceCol(game.pieces[sq+11]) == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, game.pieces[sq+11]);
			}

			//white en passant
			if(game.enPas != SQUARES.NO_SQ) {
				if(sq + 9 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}

				if(sq + 11 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}

		}

		if(game.castlePerm & CASTLEBIT.WKCA) {
			if(game.pieces[SQUARES.F1] == PIECES.EMPTY && game.pieces[SQUARES.G1] == PIECES.EMPTY) {
				if(!SqAttacked(SQUARES.F1, COLOURS.BLACK) && !SqAttacked(SQUARES.E1, COLOURS.BLACK)) {
					AddQuietMove( MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}

		if(game.castlePerm & CASTLEBIT.WQCA) {
			if(game.pieces[SQUARES.D1] == PIECES.EMPTY && game.pieces[SQUARES.C1] == PIECES.EMPTY && game.pieces[SQUARES.B1] == PIECES.EMPTY) {
				if(!SqAttacked(SQUARES.D1, COLOURS.BLACK) && !SqAttacked(SQUARES.E1, COLOURS.BLACK)) {
					AddQuietMove( MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}

	} else { //same as above but for black pawn
		pceType = PIECES.bP;

		for(pceNum = 0; pceNum < game.pceNum[pceType]; ++pceNum) {
			sq = game.pList[pieceIndex(pceType, pceNum)];
			if(game.pieces[sq - 10] == PIECES.EMPTY) {
				AddBlackPawnQuietMove(sq, sq-10);
				if(RanksBrd[sq] == RANKS.RANK_7 && game.pieces[sq - 20] == PIECES.EMPTY) {
					AddQuietMove( MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS ));
				}
			}

			if(sqOffBoard(sq - 9) == BOOL.FALSE && pieceCol(game.pieces[sq-9]) == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, game.pieces[sq-9]);
			}

			if(sqOffBoard(sq - 11) == BOOL.FALSE && pieceCol(game.pieces[sq-11]) == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, game.pieces[sq-11]);
			}

			if(game.enPas != SQUARES.NO_SQ) {
				if(sq - 9 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}

				if(sq - 11 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}
		}
		if(game.castlePerm & CASTLEBIT.BKCA) {
			if(game.pieces[SQUARES.F8] == PIECES.EMPTY && game.pieces[SQUARES.G8] == PIECES.EMPTY) {
				if(!SqAttacked(SQUARES.F8, COLOURS.WHITE) && !SqAttacked(SQUARES.E8, COLOURS.WHITE)) {
					AddQuietMove( MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}

		if(game.castlePerm & CASTLEBIT.BQCA) {
			if(game.pieces[SQUARES.D8] == PIECES.EMPTY && game.pieces[SQUARES.C8] == PIECES.EMPTY && game.pieces[SQUARES.B8] == PIECES.EMPTY) {
				if(!SqAttacked(SQUARES.D8, COLOURS.WHITE) && !SqAttacked(SQUARES.E8, COLOURS.WHITE)) {
					AddQuietMove( MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}
	}

	pceIndex = getNonSlideIndex(game.side);
	// console.log(pceIndex);
	pce = LoopNonSlidePce[pceIndex++];

	while (pce != 0) { //loops nonsliding pieces
		for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
			sq = game.pList[pieceIndex(pce, pceNum)]; //get square of pieces

			for(index = 0; index < DirNum[pce]; index++) { //loops possible directions
				dir = PceDir[pce][index]; //pceDir -> type of pice dir's index (loops)
				t_sq = sq + dir;

				if(sqOffBoard(t_sq)) { //skip if offboard
					continue;
				}

				if(game.pieces[t_sq] != PIECES.EMPTY) { // occupied by opposing piece
					if(pieceCol(game.pieces[t_sq]) != game.side) {
						AddCaptureMove( MOVE(sq, t_sq, game.pieces[t_sq], PIECES.EMPTY, 0 ));
					}
				} else {
					AddQuietMove( MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0 ));
				}
			}
		}
		pce = LoopNonSlidePce[pceIndex++];
	}

	pceIndex = getSlideIndex(game.side);
	pce = LoopSlidePce[pceIndex++];

	while(pce != 0) { //same as above for sliding pieces
		for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
			sq = game.pList[pieceIndex(pce, pceNum)];

			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;

				while( !sqOffBoard(t_sq) ) {

					if(game.pieces[t_sq]) { //if enemy piece on square, then capture
						if(pieceCol(game.pieces[t_sq]) != game.side) {
							AddCaptureMove( MOVE(sq, t_sq, game.pieces[t_sq], PIECES.EMPTY, 0 ));
						}
						break;
					}
					AddQuietMove( MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0 ));
					t_sq += dir; //sliding
				}
			}
		}
		pce = LoopSlidePce[pceIndex++];
	}
}

function GenerateCaptures() {
	game.moveListStart[game.ply+1] = game.moveListStart[game.ply];

	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;

	if(game.side == COLOURS.WHITE) {
		pceType = PIECES.wP;

		for(pceNum = 0; pceNum < game.pceNum[pceType]; ++pceNum) {
			sq = game.pList[pieceIndex(pceType, pceNum)];

			if(sqOffBoard(sq + 9) == BOOL.FALSE && pieceCol(game.pieces[sq+9]) == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, game.pieces[sq+9]);
			}

			if(sqOffBoard(sq + 11) == BOOL.FALSE && pieceCol(game.pieces[sq+11]) == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, game.pieces[sq+11]);
			}

			if(game.enPas != SQUARES.NO_SQ) {
				if(sq + 9 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}

				if(sq + 11 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}

		}

	} else {
		pceType = PIECES.bP;

		for(pceNum = 0; pceNum < game.pceNum[pceType]; ++pceNum) {
			sq = game.pList[pieceIndex(pceType, pceNum)];

			if(sqOffBoard(sq - 9) == BOOL.FALSE && pieceCol(game.pieces[sq-9]) == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, game.pieces[sq-9]);
			}

			if(sqOffBoard(sq - 11) == BOOL.FALSE && pieceCol(game.pieces[sq-11]) == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, game.pieces[sq-11]);
			}

			if(game.enPas != SQUARES.NO_SQ) {
				if(sq - 9 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}

				if(sq - 11 == game.enPas) {
					AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}
		}
	}

	pceIndex = getNonSlideIndex(game.side);
	pce = LoopNonSlidePce[pceIndex++];

	while (pce != 0) { //loop through nonsliding pieces
		for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
			sq = game.pList[pieceIndex(pce, pceNum)];

			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;

				if(sqOffBoard(t_sq) == BOOL.TRUE) {
					continue;
				}

				if(game.pieces[t_sq] != PIECES.EMPTY) {
					if(pieceCol(game.pieces[t_sq]) != game.side) {
						AddCaptureMove( MOVE(sq, t_sq, game.pieces[t_sq], PIECES.EMPTY, 0 ));
					}
				}
			}
		}
		pce = LoopNonSlidePce[pceIndex++];
	}

	pceIndex = getSlideIndex(game.side);
	pce = LoopSlidePce[pceIndex++];

	while(pce != 0) { //loops sliding pieces
		for(pceNum = 0; pceNum < game.pceNum[pce]; ++pceNum) {
			sq = game.pList[pieceIndex(pce, pceNum)];

			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;

				while( sqOffBoard(t_sq) == BOOL.FALSE ) {

					if(game.pieces[t_sq] != PIECES.EMPTY) {
						if(pieceCol(game.pieces[t_sq]) != game.side) {
							AddCaptureMove( MOVE(sq, t_sq, game.pieces[t_sq], PIECES.EMPTY, 0 ));
						}
						break;
					}
					t_sq += dir;
				}
			}
		}
		pce = LoopSlidePce[pceIndex++];
	}
}
