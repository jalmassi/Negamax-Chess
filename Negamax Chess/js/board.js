
function CheckBoard() {

	var t_pceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var t_material = [ 0, 0];
	var sq64, t_piece, t_pce_num, sq120, colour, pcount;

	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {//checks pList
		for(t_pce_num = 0; t_pce_num < game.pceNum[t_piece]; ++t_pce_num) {
			sq120 = game.pList[pieceIndex(t_piece,t_pce_num)];
			if(game.pieces[sq120] != t_piece) {
				console.log('Error Pce Lists');
				return BOOL.FALSE;
			}
		}
	}

	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) { //checks number of each piece type
		if(t_pceNum[t_piece] != game.pceNum[t_piece]) {
			console.log('Error t_pceNum');
			return BOOL.FALSE;
		}
	}

	for(sq64 = 0; sq64 < 64; ++sq64) {	//for checking material values
		sq120 = SQ120(sq64);
		t_piece = game.pieces[sq120];
		t_pceNum[t_piece]++;
		t_material[pieceCol(t_piece) += PieceVal[t_piece]];
	}

	if(t_material[COLOURS.WHITE] != game.material[COLOURS.WHITE] ||
			 t_material[COLOURS.BLACK] != game.material[COLOURS.BLACK]) {
				console.log('Error t_material');
				return BOOL.FALSE;
	}

	if(game.side!=COLOURS.WHITE && game.side!=COLOURS.BLACK) { //check side is either 0 (white) or 1(black)
				console.log('Error game.side');
				return BOOL.FALSE;
	}

	if(GeneratePosKey()!=game.posKey) {
				console.log('Error game.posKey');
				return BOOL.FALSE;
	}
	return BOOL.TRUE;
}

function PrintBoard() {

	var sq,file,rank,piece;

	// Game board
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		//each loop gets board line
		var line =(RankChar[rank] + "  "); //from rank 8 to 1
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = game.pieces[sq];
			line += (" " + PceChar[piece] + " ");
		}
	}

	var line = "   ";
	for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + FileChar[file] + ' ');
	}

	line = "";

	if(game.castlePerm & CASTLEBIT.WKCA) line += 'K';
	if(game.castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if(game.castlePerm & CASTLEBIT.BKCA) line += 'k';
	if(game.castlePerm & CASTLEBIT.BQCA) line += 'q';
	console.log("castle:" + line);
	console.log("key:" + game.posKey.toString(16));
}

function GeneratePosKey() {

	var sq = 0;
	var finalKey = 0;
	var piece = PIECES.EMPTY;

	for(sq = 0; sq < BRD_SQ_NUM; ++sq) {
		piece = game.pieces[sq];
		if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
			finalKey ^= PieceKeys[(piece * 120) + sq];
		}
	}

	if(game.side == COLOURS.WHITE) {
		finalKey ^= SideKey;
	}

	if(game.enPas != SQUARES.NO_SQ) {
		finalKey ^= PieceKeys[game.enPas];
	}

	finalKey ^= CastleKeys[game.castlePerm];

	return finalKey;

}

function PrintPieceLists() {

	var piece, pceNum;

	for(piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
		for(pceNum = 0; pceNum < game.pceNum[piece]; ++pceNum) {
			console.log('Piece ' + PceChar[piece] + ' on ' + PrSq( game.pList[pieceIndex(piece,pceNum)] ));
		}
	}

}

function UpdateListsMaterial() {

	var piece,sq,index,colour;

	for(index = 0; index < 14 * 120; ++index) {
		game.pList[index] = PIECES.EMPTY;
	}

	for(index = 0; index < 2; ++index) {
		game.material[index] = 0;
	}

	for(index = 0; index < 13; ++index) {
		game.pceNum[index] = 0;
	}

	for(index = 0; index < 64; ++index) {
		sq = SQ120(index);
		piece = game.pieces[sq];
		if(piece != PIECES.EMPTY) {

			colour = pieceCol(piece);

			game.material[colour] += PieceVal[piece];

			game.pList[pieceIndex(piece,game.pceNum[piece])] = sq;
			game.pceNum[piece]++;
		}
	}
}

function ResetBoard() {

	var index = 0;

	for(index = 0; index < BRD_SQ_NUM; ++index) {
		game.pieces[index] = SQUARES.OFFBOARD;
	}

	for(index = 0; index < 64; ++index) {
		game.pieces[SQ120(index)] = PIECES.EMPTY;
	}

	game.side = COLOURS.BOTH;
	game.enPas = SQUARES.NO_SQ; //en passant corresponds to sq
	game.fiftyMove = 0;
	game.ply = 0;
	game.hisPly = 0;
	game.castlePerm = 0;
	game.posKey = 0;
	game.moveListStart[game.ply] = 0;

}

function PrintSqAttacked() {

	var sq,file,rank,piece;

	console.log("\nAttacked:\n");

	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =((rank+1) + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			if(SqAttacked(sq, game.side^1) == BOOL.TRUE) piece = "X";
			else piece = "-";
			line += (" " + piece + " ");
		}
		console.log(line);
	}

	console.log("");

}

function SqAttacked(sq, side) {
	var pce;
	var t_sq;
	var index;

	if(side == COLOURS.WHITE) {
		if(game.pieces[sq - 11] == PIECES.wP || game.pieces[sq - 9] == PIECES.wP) {
			return BOOL.TRUE;
		}
	} else {
		if(game.pieces[sq + 11] == PIECES.bP || game.pieces[sq + 9] == PIECES.bP) {
			return BOOL.TRUE;
		}
	}

	for(index = 0; index < 8; index++) {
		pce = game.pieces[sq + KnDir[index]];
		if(pce != SQUARES.OFFBOARD && pieceCol(pce) == side && pieceKnight(pce) == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}

	for(index = 0; index < 4; ++index) {
		dir = RkDir[index];
		t_sq = sq + dir;
		pce = game.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(pieceRookQueen(pce) == BOOL.TRUE && pieceCol(pce) == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = game.pieces[t_sq];
		}
	}

	for(index = 0; index < 4; ++index) {
		dir = BiDir[index];
		t_sq = sq + dir;
		pce = game.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(pieceBishopQueen(pce) == BOOL.TRUE && pieceCol(pce) == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = game.pieces[t_sq];
		}
	}

	for(index = 0; index < 8; index++) {
		pce = game.pieces[sq + KiDir[index]];
		if(pce != SQUARES.OFFBOARD && pieceCol(pce) == side && pieceKing(pce) == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}

	return BOOL.FALSE;


}
