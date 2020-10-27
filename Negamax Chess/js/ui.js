$("#SetFen").click(function () {
	var fenStr = $("#fenIn").val(); //gets FEN string, to set chess position
	NewGame(fenStr);
});

$('#TakeButton').click( function () {
	if(game.hisPly > 0) {
		TakeMove();
		game.ply = 0;
		SetInitialBoardPieces();
	}
});

$('#NewGameButton').click( function () {
	NewGame(START_FEN);
});

function NewGame(fenStr) {
	ParseFen(fenStr);
	PrintBoard();
	SetInitialBoardPieces();
	CheckAndSet();
}

function ClearAllPieces() {
	$(".Piece").remove();
}

function SetInitialBoardPieces() {

	var sq;
	var sq120;
	var pce;

	ClearAllPieces();

	for(sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = game.pieces[sq120];
		if(pce >= PIECES.wP && pce <= PIECES.bK) {
			addPiece(sq120, pce);
		}
	}
}

function DeSelectSq(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left)) {
				$(this).removeClass('SqSelected');
		}
	} );
}

function SetSqSelected(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left)) {
				$(this).addClass('SqSelected');
		}
	} );
}

function ClickedSquare(pageX, pageY) {
	console.log('ClickedSquare() at ' + pageX + ',' + pageY);
	var position = $('#Board').position();

	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);

	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);

	var file = Math.floor((pageX-workedX) / 60);
	var rank = 7 - Math.floor((pageY-workedY) / 60);

	var sq = FR2SQ(file,rank);

	console.log('Clicked sq:' + PrSq(sq));

	SetSqSelected(sq);

	return sq;
}

$(document).on('click','.Piece', function (e) {
	console.log('Piece Click');

	if(UserMove.from == SQUARES.NO_SQ) {
		UserMove.from = ClickedSquare(e.pageX, e.pageY);
	} else {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
	}

	MakeUserMove();

});

$(document).on('click','.Square', function (e) {
	console.log('Square Click');
	if(UserMove.from != SQUARES.NO_SQ) {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
		MakeUserMove();
	}

});

function MakeUserMove() {

	if(UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {

		console.log("User Move:" + PrSq(UserMove.from) + PrSq(UserMove.to));

		var parsed = ParseMove(UserMove.from,UserMove.to);

		if(parsed != NOMOVE) {
			MakeMove(parsed);
			PrintBoard();
			movePiece(parsed);
			CheckAndSet();
			PreSearch();
		}

		DeSelectSq(UserMove.from);
		DeSelectSq(UserMove.to);

		UserMove.from = SQUARES.NO_SQ;
		UserMove.to = SQUARES.NO_SQ;
	}

}

function PieceIsOnSq(sq, top, left) {

	if( (RanksBrd[sq] == 7 - Math.round(top/60) ) &&
		FilesBrd[sq] == Math.round(left/60) ) {
		return BOOL.TRUE;
	}

	return BOOL.FALSE;

}

function removePiece(sq) {

	$('.Piece').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).remove();
		}
	} );

}

function addPiece(sq, pce) {

	var file = FilesBrd[sq];
	var rank = RanksBrd[sq];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	var pieceFileName = "images/" + SideChar[pieceCol(pce)] + PceChar[pce].toUpperCase() + ".png";
	var	imageString = "<image src=\"" + pieceFileName + "\" class=\"pce Piece " + rankName + " " + fileName + "\"/>";
	$("#Board").append(imageString);
}

function movePiece(move) {

	var from = fromSq(move);
	var to = toSq(move);

	if(move & MFLAGEP) {
		var epRemove;
		if(game.side == COLOURS.BLACK) {
			epRemove = to - 10;
		} else {
			epRemove = to + 10;
		}
		removePiece(epRemove);
	} else if(capturedP(move)) {
		removePiece(to);
	}

	var file = FilesBrd[to];
	var rank = RanksBrd[to];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);

	$('.Piece').each( function(index) {
		if(PieceIsOnSq(from, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).removeClass();
			$(this).addClass("Piece " + rankName + " " + fileName);
		}
	} );

	if(move & MFLAGCA) {
		switch(to) {
			case SQUARES.G1: removePiece(SQUARES.H1); addPiece(SQUARES.F1, PIECES.wR); break;
			case SQUARES.C1: removePiece(SQUARES.A1); addPiece(SQUARES.D1, PIECES.wR); break;
			case SQUARES.G8: removePiece(SQUARES.H8); addPiece(SQUARES.F8, PIECES.bR); break;
			case SQUARES.C8: removePiece(SQUARES.A8); addPiece(SQUARES.D8, PIECES.bR); break;
		}
	} else if (promotedP(move)) {
		removePiece(to);
		addPiece(to, promotedP(move));
	}

}

function DrawMaterial() {

	if (game.pceNum[PIECES.wP]!=0 || game.pceNum[PIECES.bP]!=0) return BOOL.FALSE;
	if (game.pceNum[PIECES.wQ]!=0 || game.pceNum[PIECES.bQ]!=0 ||
					game.pceNum[PIECES.wR]!=0 || game.pceNum[PIECES.bR]!=0) return BOOL.FALSE;
	if (game.pceNum[PIECES.wB] > 1 || game.pceNum[PIECES.bB] > 1) {return BOOL.FALSE;}
    if (game.pceNum[PIECES.wN] > 1 || game.pceNum[PIECES.bN] > 1) {return BOOL.FALSE;}

	if (game.pceNum[PIECES.wN]!=0 && game.pceNum[PIECES.wB]!=0) {return BOOL.FALSE;}
	if (game.pceNum[PIECES.bN]!=0 && game.pceNum[PIECES.bB]!=0) {return BOOL.FALSE;}

	return BOOL.TRUE;
}

function ThreeFoldRep() {
	var i = 0, r = 0;

	for(i = 0; i < game.hisPly; ++i) {
		if (game.history[i].posKey == game.posKey) {
		    r++;
		}
	}
	return r;
}

function CheckResult() {
	if(game.fiftyMove >= 100) {
		 $("#GameStatus").text("GAME DRAWN: 50 move rule");
		 return BOOL.TRUE;
	}

	if (ThreeFoldRep() >= 2) {
     	$("#GameStatus").text("GAME DRAWN: 3-fold repetition");
     	return BOOL.TRUE;
    }

	if (DrawMaterial()) {
     	$("#GameStatus").text("GAME DRAWN: insufficient material to mate");
     	return BOOL.TRUE;
    }

    GenerateMoves();

    var MoveNum = 0;
	var found = 0;

	for(MoveNum = game.moveListStart[game.ply]; MoveNum < game.moveListStart[game.ply + 1]; ++MoveNum)  {

        if (!MakeMove(game.moveList[MoveNum]))  {
            continue;
        }
        found++;
		TakeMove();
		break;
    }

	if(found != 0) return BOOL.FALSE;

	var InCheck = SqAttacked(game.pList[pieceIndex(Kings[game.side],0)], game.side^1);

	if(InCheck) {
		if(game.side == COLOURS.WHITE) {
	      $("#GameStatus").text("GAME OVER {black mates}");
	      return BOOL.TRUE;
        } else {
	      $("#GameStatus").text("GAME OVER {white mates}");
	      return BOOL.TRUE;
        }
	} else {
		$("#GameStatus").text("GAME DRAWN {stalemate}");return BOOL.TRUE;
	}

	return BOOL.FALSE;
}

function CheckAndSet() {
	if(CheckResult()) {
		controller.GameOver = BOOL.TRUE;
	} else {
		controller.GameOver = BOOL.FALSE;
		$("#GameStatus").text('');
	}
}

function PreSearch() {
	if(!controller.GameOver) {
		searchC.thinking = BOOL.TRUE;
		setTimeout( function() { StartSearch(); }, 200 );
	}
}

$('#SearchButton').click( function () {
	controller.PlayerSide = controller.side ^ 1;
	PreSearch();
});

function StartSearch() {

	searchC.depth = MAXDEPTH;
	var t = $.now();
	var tt = $('#ThinkTimeChoice').val();

	searchC.time = parseInt(tt) * 1000;
	SearchPosition();

	MakeMove(searchC.best);
	movePiece(searchC.best);
	CheckAndSet();
}
