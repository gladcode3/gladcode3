var images = [
	//gender
	{'id': 'male', 'path': 'male.png', 'png': true, 'height': 256, 'width': 256, 'parent': 'gender', 'default': true},
	{'id': 'female', 'path': 'female.png', 'png': true, 'height': 256, 'width': 256, 'parent': 'gender'},
	//male body
	{'id': 'male-light', 'path': 'body/male/light.png', 'parent': 'shape', 'req': 'male', 'layer': 0, 'default': true},
	{'id': 'male-tanned', 'path': 'body/male/tanned.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-tanned2', 'path': 'body/male/tanned2.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-olive', 'path': 'body/male/man_olive.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-dark', 'path': 'body/male/dark.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-brown', 'path': 'body/male/man_brown.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-dark2', 'path': 'body/male/dark2.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-black', 'path': 'body/male/man_black.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-darkelf2', 'path': 'body/male/darkelf2.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-darkelf', 'path': 'body/male/darkelf.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-orc', 'path': 'body/male/orc.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'male-red_orc', 'path': 'body/male/red_orc.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	{'id': 'skeleton', 'path': 'body/male/skeleton.png', 'parent': 'shape', 'req': 'male', 'layer': 0},
	//female body
	{'id': 'female-light', 'path': 'body/female/light.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-tanned', 'path': 'body/female/tanned.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-tanned2', 'path': 'body/female/tanned2.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-olive', 'path': 'body/female/woman_olive.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-dark', 'path': 'body/female/dark.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-brown', 'path': 'body/female/woman_brown.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-dark2', 'path': 'body/female/dark2.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-black', 'path': 'body/female/woman_black.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-darkelf2', 'path': 'body/female/darkelf2.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-darkelf', 'path': 'body/female/darkelf.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-orc', 'path': 'body/female/orc.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	{'id': 'female-red_orc', 'path': 'body/female/red_orc.png', 'parent': 'shape', 'req': 'female', 'layer': 0},
	//hair style
	{'id': 'hair_none', 'path': '', 'parent': 'style', 'layer': 1, 'default': true},
	//beards
	{'id': 'facial_none', 'path': '', 'parent': 'facial', 'layer': 1, 'default': true},
	{'id': 'fiveoclock_black', 'path': 'facial/male/fiveoclock/black.png', 'parent': 'facial', 'layer': 1, 'block': 'bcolor', 'scale': 4},
	//eyes
	{'id': 'eyes_blue', 'path': 'body/male/eyes/blue.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	{'id': 'eyes_brown', 'path': 'body/male/eyes/brown.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	{'id': 'eyes_gray', 'path': 'body/male/eyes/gray.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	{'id': 'eyes_green', 'path': 'body/male/eyes/green.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	{'id': 'eyes_orange', 'path': 'body/male/eyes/orange.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	{'id': 'eyes_purple', 'path': 'body/male/eyes/purple.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	{'id': 'eyes_red', 'path': 'body/male/eyes/red.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	{'id': 'eyes_yellow', 'path': 'body/male/eyes/yellow.png', 'parent': 'eyes', 'layer': 1, 'scale': 3},
	//ears
	{'id': 'default_ears', 'path': '', 'parent': 'ears', 'layer': 1, 'default': true},
	{'id': 'bigears_dark', 'path': 'body/male/ears/bigears_dark.png', 'parent': 'ears', 'req': {'or': ['male-dark', 'female-dark']}, 'layer': 1, 'scale': 2},
	{'id': 'bigears_dark2', 'path': 'body/male/ears/bigears_dark2.png', 'parent': 'ears', 'req': {'or': ['male-dark2', 'female-dark2']}, 'layer': 1, 'scale': 2},
	{'id': 'bigears_darkelf', 'path': 'body/male/ears/bigears_darkelf.png', 'parent': 'ears', 'req': {'or': ['male-darkelf', 'female-darkelf']}, 'layer': 1, 'scale': 2},
	{'id': 'bigears_darkelf2', 'path': 'body/male/ears/bigears_darkelf2.png', 'parent': 'ears', 'req': {'or': ['male-darkelf2', 'female-darkelf2']}, 'layer': 1, 'scale': 2},
	{'id': 'bigears_light', 'path': 'body/male/ears/bigears_light.png', 'parent': 'ears', 'req': {'or': ['male-light', 'female-light']}, 'layer': 1, 'scale': 2},
	{'id': 'bigears_tanned', 'path': 'body/male/ears/bigears_tanned.png', 'parent': 'ears', 'req': {'or': ['male-tanned', 'female-tanned']}, 'layer': 1, 'scale': 2},
	{'id': 'bigears_tanned2', 'path': 'body/male/ears/bigears_tanned2.png', 'parent': 'ears', 'req': {'or': ['male-tanned2', 'female-tanned2']}, 'layer': 1, 'scale': 2},
	{'id': 'elvenears_dark', 'path': 'body/male/ears/elvenears_dark.png', 'parent': 'ears', 'req': {'or': ['male-dark', 'female-dark']}, 'layer': 1, 'scale': 2},
	{'id': 'elvenears_dark2', 'path': 'body/male/ears/elvenears_dark2.png', 'parent': 'ears', 'req': {'or': ['male-dark2', 'female-dark2']}, 'layer': 1, 'scale': 2},
	{'id': 'elvenears_darkelf', 'path': 'body/male/ears/elvenears_darkelf.png', 'parent': 'ears', 'req': {'or': ['male-darkelf', 'female-darkelf']}, 'layer': 1, 'scale': 2},
	{'id': 'elvenears_darkelf2', 'path': 'body/male/ears/elvenears_darkelf2.png', 'parent': 'ears', 'req': {'or': ['male-darkelf2', 'female-darkelf2']}, 'layer': 1, 'scale': 2},
	{'id': 'elvenears_light', 'path': 'body/male/ears/elvenears_light.png', 'parent': 'ears', 'req': {'or': ['male-light', 'female-light']}, 'layer': 1, 'scale': 2},
	{'id': 'elvenears_tanned', 'path': 'body/male/ears/elvenears_tanned.png', 'parent': 'ears', 'req': {'or': ['male-tanned', 'female-tanned']}, 'layer': 1, 'scale': 2},
	{'id': 'elvenears_tanned2', 'path': 'body/male/ears/elvenears_tanned2.png', 'parent': 'ears', 'req': {'or': ['male-tanned2', 'female-tanned2']}, 'layer': 1, 'scale': 2},
	//shirt
	{'id': 'shirt_none', 'path': '', 'parent': 'shirt', 'layer': 1, 'default': true},
	{'id': 'female_bikini', 'path': 'torso/dress_female/blue_vest.png', 'parent': 'shirt', 'req': 'female', 'layer': 1},
	{'id': 'female_dress', 'path': 'torso/dress_female/underdress.png', 'parent': 'shirt', 'req': 'female', 'layer': 3, 'block': ['legs', 'armor']},
	{'id': 'female_dress_sash', 'path': 'torso/dress_female/dress_w_sash_female.png', 'parent': 'shirt', 'req': 'female', 'layer': 2, 'block': ['legs', 'armor']},
	{'id': 'female_tightdress_black', 'path': 'torso/dress_female/tightdress_black.png', 'parent': 'shirt', 'req': 'female', 'layer': 3, 'block': ['legs', 'armor']},
	{'id': 'female_tightdress_red', 'path': 'torso/dress_female/tightdress_red.png', 'parent': 'shirt', 'req': 'female', 'layer': 3, 'block': ['legs', 'armor']},
	{'id': 'female_tightdress_white', 'path': 'torso/dress_female/tightdress_white.png', 'parent': 'shirt', 'req': 'female', 'layer': 3, 'block': ['legs', 'armor']},
	{'id': 'female_tightdress_lightblue', 'path': 'torso/dress_female/tightdress_lightblue.png', 'parent': 'shirt', 'req': 'female', 'layer': 3, 'block': ['legs', 'armor']},
	//armor
	{'id': 'armor_none', 'path': '', 'parent': 'armor', 'layer': 2, 'default': true},
	{'id': 'male_chain', 'path': 'torso/chain/mail_male.png', 'parent': 'armor', 'req': 'male', 'layer': 2},
	{'id': 'male_leather-chest', 'path': 'torso/leather/chest_male.png', 'parent': 'armor', 'req': 'male', 'layer': 2},
	{'id': 'male_plate-chest', 'path': 'torso/plate/chest_male.png', 'parent': 'armor', 'req': 'male', 'layer': 2},
	{'id': 'male_gold-chest', 'path': 'torso/gold/chest_male.png', 'parent': 'armor', 'req': 'male', 'layer': 2},
	{'id': 'female_chain', 'path': 'torso/chain/mail_female.png', 'parent': 'armor', 'req': 'female', 'layer': 2},
	{'id': 'female_leather-chest', 'path': 'torso/leather/chest_female.png', 'parent': 'armor', 'req': 'female', 'layer': 2},
	{'id': 'female_plate-chest', 'path': 'torso/plate/chest_female.png', 'parent': 'armor', 'req': 'female', 'layer': 2},
	{'id': 'female_gold-chest', 'path': 'torso/gold/chest_female.png', 'parent': 'armor', 'req': 'female', 'layer': 2},
	//legs
	{'id': 'legs_none', 'path': '', 'parent': 'legs', 'layer': 1, 'default': true},
	{'id': 'male_plate-legs', 'path': 'legs/armor/male/metal_pants_male.png', 'parent': 'legs', 'req': 'male', 'layer': 1},
	{'id': 'male_gold-legs', 'path': 'legs/armor/male/golden_greaves_male.png', 'parent': 'legs', 'req': 'male', 'layer': 1},
	{'id': 'male_robe-skirt', 'path': 'legs/skirt/male/robe_skirt_male.png', 'parent': 'legs', 'req': 'male', 'layer': 3},
	{'id': 'female_plate-legs', 'path': 'legs/armor/female/metal_pants_female.png', 'parent': 'legs', 'req': 'female', 'layer': 1},
	{'id': 'female_gold-legs', 'path': 'legs/armor/female/golden_greaves_female.png', 'parent': 'legs', 'req': 'female', 'layer': 1},
	{'id': 'female_robe-skirt', 'path': 'legs/skirt/female/robe_skirt_female.png', 'parent': 'legs', 'req': 'female', 'layer': 3},
	//head
	{'id': 'head_none', 'path': '', 'parent': 'head', 'layer': 2, 'default': true},
	{'id': 'male_cap', 'path': 'head/caps/male/leather_cap_male.png', 'parent': 'head', 'req': 'male', 'layer': 6},
	{'id': 'male_wizard-hat', 'path': 'head/caps/male/wizard_hat_male.png', 'parent': 'head', 'req': 'male', 'layer': 6},
	{'id': 'male_cloth-hood', 'path': 'head/hoods/male/cloth_hood_male.png', 'parent': 'head', 'req': 'male', 'block': 'style', 'layer': 6},
	{'id': 'male_chain-hood', 'path': 'head/hoods/male/chain_hood_male.png', 'parent': 'head', 'req': 'male', 'block': 'style', 'layer': 6},
	{'id': 'male_chain-hat', 'path': 'head/helms/male/chainhat_male.png', 'parent': 'head', 'req': 'male', 'layer': 6},
	{'id': 'male_metal-helmet', 'path': 'head/helms/male/metal_helm_male.png', 'parent': 'head', 'req': 'male', 'block': 'style', 'layer': 6},
	{'id': 'male_gold-helmet', 'path': 'head/helms/male/golden_helm_male.png', 'parent': 'head', 'req': 'male', 'block': 'style', 'layer': 6},
	{'id': 'male_bandana_red', 'path': 'head/bandanas/male/red.png', 'parent': 'head', 'req': 'male', 'layer': 6},
	{'id': 'male_bandana_blue', 'path': 'head/bandanas/male/blue.png', 'parent': 'head', 'req': 'male', 'layer': 6},
	{'id': 'male_bandana_black', 'path': 'head/bandanas/male/black.png', 'parent': 'head', 'req': 'male', 'layer': 6},
	{'id': 'female_cap', 'path': 'head/caps/female/leather_cap_female.png', 'parent': 'head', 'req': 'female', 'layer': 6},
	{'id': 'female_wizard-hat', 'path': 'head/caps/female/wizard_hat_female.png', 'parent': 'head', 'req': 'female', 'layer': 6},
	{'id': 'female_cloth-hood', 'path': 'head/hoods/female/cloth_hood_female.png', 'parent': 'head',  'req': 'female', 'block': 'style', 'layer': 6},
	{'id': 'female_chain-hood', 'path': 'head/hoods/female/chain_hood_female.png', 'parent': 'head',  'req': 'female', 'block': 'style', 'layer': 6},
	{'id': 'female_chain-hat', 'path': 'head/helms/female/chainhat_female.png', 'parent': 'head', 'req': 'female', 'layer': 6},
	{'id': 'female_metal-helmet', 'path': 'head/helms/female/metal_helm_female.png', 'parent': 'head', 'req': 'female', 'block': 'style', 'layer': 6},
	{'id': 'female_gold-helmet', 'path': 'head/helms/female/golden_helm_female.png', 'parent': 'head', 'req': 'female', 'block': 'style', 'layer': 6},
	{'id': 'female_bandana_red', 'path': 'head/bandanas/female/red.png', 'parent': 'head', 'req': 'female', 'layer': 6},
	{'id': 'female_bandana_blue', 'path': 'head/bandanas/female/blue.png', 'parent': 'head', 'req': 'female', 'layer': 6},
	{'id': 'female_bandana_black', 'path': 'head/bandanas/female/black.png', 'parent': 'head', 'req': 'female', 'layer': 6},
	//hands
	{'id': 'hands_none', 'path': '', 'parent': 'hands', 'layer': 1, 'default': true},
	{'id': 'male_gold-gauntlet', 'path': 'hands/gloves/male/golden_gloves_male.png', 'parent': 'hands', 'req': 'male', 'layer': 1, 'scale': 1.4, 'posy': -10},
	{'id': 'male_metal-gauntlet', 'path': 'hands/gloves/male/metal_gloves_male.png', 'parent': 'hands', 'req': 'male', 'layer': 1, 'scale': 1.4, 'posy': -10},
	{'id': 'female_gold-gauntlet', 'path': 'hands/gloves/female/golden_gloves_female.png', 'parent': 'hands', 'req': 'female', 'layer': 1, 'scale': 1.4, 'posy': -10},
	{'id': 'female_metal-gauntlet', 'path': 'hands/gloves/female/metal_gloves_female.png', 'parent': 'hands', 'req': 'female', 'layer': 1, 'scale': 1.4, 'posy': -10},
	//shoulder
	{'id': 'shoulder_none', 'path': '', 'parent': 'shoulder', 'layer': 1, 'default': true},
	{'id': 'male_gold-shoulder', 'path': 'torso/gold/arms_male.png', 'parent': 'shoulder', 'req': 'male', 'layer': 3},
	{'id': 'male_metal-shoulder', 'path': 'torso/plate/arms_male.png', 'parent': 'shoulder', 'req': 'male', 'layer': 3},
	{'id': 'male_leather-shoulder', 'path': 'torso/leather/shoulders_male.png', 'parent': 'shoulder', 'req': 'male', 'layer': 3},
	{'id': 'female_gold-shoulder', 'path': 'torso/gold/arms_female.png', 'parent': 'shoulder', 'req': 'female', 'layer': 3},
	{'id': 'female_metal-shoulder', 'path': 'torso/plate/arms_female.png', 'parent': 'shoulder', 'req': 'female', 'layer': 3},
	{'id': 'female_leather-shoulder', 'path': 'torso/leather/shoulders_female.png', 'parent': 'shoulder', 'req': 'female', 'layer': 3},
	//feet
	{'id': 'feet_none', 'path': '', 'parent': 'feet', 'layer': 1, 'default': true},
	{'id': 'male_gold-feet', 'path': 'feet/armor/male/golden_boots_male.png', 'parent': 'feet', 'req': 'male', 'layer': 2, 'scale': 1.5, 'posy': -25},
	{'id': 'male_metal-feet', 'path': 'feet/armor/male/metal_boots_male.png', 'parent': 'feet', 'req': 'male', 'layer': 2, 'scale': 1.5, 'posy': -25},
	{'id': 'male_shoes_black', 'path': 'feet/shoes/male/black_shoes_male.png', 'parent': 'feet', 'req': 'male', 'layer': 2, 'scale': 1.5, 'posy': -25},
	{'id': 'male_shoes_brown', 'path': 'feet/shoes/male/brown_shoes_male.png', 'parent': 'feet', 'req': 'male', 'layer': 2, 'scale': 1.5, 'posy': -25},
	{'id': 'female_gold-feet', 'path': 'feet/armor/female/golden_boots_female.png', 'parent': 'feet', 'req': 'female', 'layer': 2, 'scale': 1.5, 'posy': -25},
	{'id': 'female_metal-feet', 'path': 'feet/armor/female/metal_boots_female.png', 'parent': 'feet', 'req': 'female', 'layer': 2, 'scale': 1.5, 'posy': -25},
	{'id': 'female_shoes_black', 'path': 'feet/shoes/female/black_shoes_female.png', 'parent': 'feet', 'req': 'female', 'layer': 2, 'scale': 1.5, 'posy': -25},
	{'id': 'female_shoes_brown', 'path': 'feet/shoes/female/brown_shoes_female.png', 'parent': 'feet', 'req': 'female', 'layer': 2, 'scale': 1.5, 'posy': -25},
	//melee weapons
	{'id': 'melee_none', 'path': '', 'parent': 'melee', 'layer': 1, 'default': true},
	//ranged weapons
	{'id': 'ranged_none', 'path': '', 'parent': 'ranged', 'layer': 1, 'default': true},
	{'id': 'bow', 'path': 'weapons/shoot/bow.png', 'parent': 'ranged', 'select': 'arrows', 'layer': 6, 'line': 17, 'col': 3, 'move': 'shoot'},
	{'id': 'greatbow', 'path': 'weapons/shoot/greatbow.png', 'parent': 'ranged', 'select': 'arrows', 'layer': 6, 'line': 17, 'col': 3, 'move': 'shoot'},
	{'id': 'recurvebow', 'path': 'weapons/shoot/recurvebow.png', 'parent': 'ranged', 'select': 'arrows', 'layer': 6, 'line': 17, 'col': 3, 'move': 'shoot'},
	{'id': 'arcoreal', 'path': 'weapons/shoot/arcoreal.png', 'parent': 'ranged', 'select': 'arrows', 'layer': 6, 'line': 17, 'col': 3, 'move': 'shoot'},
	{'id': 'arrows', 'path': 'weapons/misc/arrow.png', 'parent': 'none', 'layer': 1},
	//shield
	{'id': 'shield_none', 'path': '', 'parent': 'shield', 'layer': 1, 'default': true},
	//belt
	{'id': 'belt_none', 'path': '', 'parent': 'belt', 'layer': 1, 'default': true},
	{'id': 'male_belt_white-cloth', 'path': 'belt/cloth/male/white_cloth_male.png', 'parent': 'belt', 'req': 'male', 'layer': 4, 'scale': 1.5, 'posy': -10},
	{'id': 'male_belt_leather', 'path': 'belt/leather/male/leather_male.png', 'parent': 'belt', 'req': 'male', 'layer': 4, 'scale': 1.5, 'posy': -10},
	{'id': 'female_belt_white-cloth', 'path': 'belt/cloth/female/white_cloth_female.png', 'parent': 'belt', 'req': 'female', 'layer': 4, 'scale': 1.5, 'posy': -10},
	{'id': 'female_belt_leather', 'path': 'belt/leather/female/leather_female.png', 'parent': 'belt', 'req': 'female', 'layer': 4, 'scale': 1.5, 'posy': -10},
	//cape
	{'id': 'cape_none', 'path': '', 'parent': 'cape', 'layer': 1, 'default': true},
	//oversize
	{'id': 'oversize_spear', 'path': 'weapons/oversize/two hand/either/spear.png', 'parent': 'melee', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'thrust', 'oversize': true, 'scale': 1.7, 'posx': 50, 'posy': 40},
	{'id': 'oversize_dragonspear', 'path': 'weapons/oversize/two hand/either/dragonspear.png', 'parent': 'melee', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'thrust', 'oversize': true, 'scale': 1.7, 'posx': 50, 'posy': 40},
	{'id': 'oversize_trident', 'path': 'weapons/oversize/two hand/either/trident.png', 'parent': 'melee', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'thrust', 'oversize': true, 'scale': 1.7, 'posx': 50, 'posy': 40},
	{'id': 'male_oversize_mace', 'path': 'weapons/oversize/right hand/male/mace_male.png', 'parent': 'melee', 'req': 'male', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
	{'id': 'male_oversize_longsword', 'path': 'weapons/oversize/right hand/male/longsword_male.png', 'parent': 'melee', 'req': 'male', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
	{'id': 'male_oversize_rapier', 'path': 'weapons/oversize/right hand/male/rapier_male.png', 'parent': 'melee', 'req': 'male', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
	{'id': 'male_oversize_saber', 'path': 'weapons/oversize/right hand/male/saber_male.png', 'parent': 'melee', 'req': 'male', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
	{'id': 'female_oversize_mace', 'path': 'weapons/oversize/right hand/female/mace_female.png', 'parent': 'melee', 'req': 'female', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
	{'id': 'female_oversize_longsword', 'path': 'weapons/oversize/right hand/female/longsword_female.png', 'parent': 'melee', 'req': 'female', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
	{'id': 'female_oversize_rapier', 'path': 'weapons/oversize/right hand/female/rapier_female.png', 'parent': 'melee', 'req': 'female', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
	{'id': 'female_oversize_saber', 'path': 'weapons/oversize/right hand/female/saber_female.png', 'parent': 'melee', 'req': 'female', 'layer': {'default': 6, 'down': 7}, 'line': 1, 'move': 'slash', 'oversize': true, 'scale': 3, 'posx': 150, 'posy': 110},
];

$(document).ready( function() {
	fill_assets();
});

function fill_assets(){
	var colors = ['black', 'blonde', 'blonde2', 'blue', 'blue2', 'brown', 'brown2', 'brunette', 'brunette2', 'dark-blonde', 'gold', 'gray', 'gray2', 'green', 'green2', 'light-blonde', 'light-blonde2', 'pink', 'pink2', 'purple', 'raven', 'raven2', 'redhead', 'redhead2', 'ruby-red', 'white', 'white-blonde', 'white-blonde2', 'white-cyan'];

	var styles = [
		['beard', 'bigstache', 'frenchstache', 'mustache'],
		['bangs', 'bangslong', 'bangslong2', 'bangsshort', 'bedhead', 'bunches', 'jewfro', 'long', 'longhawk', 'longknot', 'loose', 'messy1', 'messy2', 'mohawk', 'page', 'page2', 'parted', 'pixie', 'plain', 'ponytail', 'ponytail2', 'princess', 'shorthawk', 'shortknot', 'shoulderl', 'shoulderr', 'swoop', 'unkempt', 'xlong', 'xlongknot']
	];
	
	var templates = [
		//beard
		"{\"id\": \"A_B\", \"path\": \"facial/male/A/B.png\", \"parent\": [\"facial\", \"bcolor\"], \"layer\": 1, \"scale\": 4}",
		//hair
		"{\"id\": \"A_B\", \"path\": \"hair/male/A/B.png\", \"parent\": [\"style\", \"color\"], \"layer\": 5}",
	];
	for (k=0 ; k<templates.length ; k++){
		for (i=0 ; i<styles[k].length ; i++){
			for (j=0 ; j<colors.length ; j++){
				var new_style = templates[k];
				new_style = new_style.replace(/A/g,styles[k][i]); 
				new_style = new_style.replace(/B/g,colors[j]);
				images.push(JSON.parse(new_style));
			}	
		}	
	}
	
	//shirts
	colors = ['black', 'blue', 'brown', 'green', 'pink', 'purple', 'red', 'teal', 'white', 'yellow'];
	styles = [
		['longsleeve'],
		['pirate', 'sleeveless', 'corset']
	];
	var path = [
		['torso/shirts/longsleeve/male/B_A.png'],
		['torso/shirts/sleeveless/female/B_A.png', 'torso/shirts/sleeveless/female/B_A.png', 'torso/corset_female/A_B.png']
	];
	var gender = ['male', 'female'];
	templates = "{\"id\": \"D_A_B\", \"path\": \"C\", \"parent\": \"shirt\", \"req\": \"D\", \"layer\": 1}";

	for (k=0 ; k<gender.length ; k++){
		for (j=0 ; j<colors.length ; j++){
			for (i=0 ; i<styles[k].length ; i++){
				var new_shirt = templates;
				new_shirt = new_shirt.replace(/C/g,path[k][i]); 
				new_shirt = new_shirt.replace(/B/g,colors[j]); 
				new_shirt = new_shirt.replace(/A/g,styles[k][i]); 
				new_shirt = new_shirt.replace(/D/g,gender[k]); 
				images.push(JSON.parse(new_shirt));
			}	
		}	
	}
	
	//pants
	colors = ['black', 'dark-blue', 'teal', 'green', 'brown', 'red', 'magenta', 'white'];
	var gender = ['male', 'female'];
	templates = "{\"id\": \"D_pants_B\", \"path\": \"legs/pants/D/B_pants_D.png\", \"parent\": \"legs\", \"req\": \"D\", \"layer\": 1}";

	for (k=0 ; k<gender.length ; k++){
		for (j=0 ; j<colors.length ; j++){
			var new_pants = templates;
			new_pants = new_pants.replace(/B/g,colors[j]); 
			new_pants = new_pants.replace(/D/g,gender[k]); 
			images.push(JSON.parse(new_pants));
		}	
	}
	
	//weapons
	var weapons = [
		{'name': 'spear', 'type': 'thrust', 'line': 5},
		{'name': 'staff', 'type': 'thrust', 'line': 5},
		{'name': 'dagger', 'type': 'slash', 'line': 13},
		{'name': 'woodwand', 'type': 'slash', 'line': 13},
		{'name': 'steelwand', 'type': 'slash', 'line': 13},
		{'name': 'sword', 'type': 'slash', 'line': 13},
		{'name': 'warhammer', 'type': 'slash', 'line': 13},
	];
	var gender = ['male', 'female'];
	templates = "{\"id\": \"A_B\", \"path\": \"weapons/C/A/B.png\", \"parent\": \"melee\", \"req\": \"A\", \"layer\": {\"default\": 6, \"down\": 7}, \"line\": D, \"move\": \"C\"}";

	for (k=0 ; k<gender.length ; k++){
		for (j=0 ; j<weapons.length ; j++){
			var new_weapon = templates;
			new_weapon = new_weapon.replace(/A/g,gender[k]); 
			new_weapon = new_weapon.replace(/B/g,weapons[j].name); 
			new_weapon = new_weapon.replace(/C/g,weapons[j].type); 
			new_weapon = new_weapon.replace(/D/g,weapons[j].line); 
			images.push(JSON.parse(new_weapon));
		}	
	}

	//shields
	var names = ['1', '9', '10', '5', '6', '3', '4', '7', '8'];
	var gender = ['male', 'female'];
	templates = "{\"id\": \"A_shield_B\", \"path\": \"weapons/shield pack/A/B.png\", \"parent\": \"shield\", \"req\": \"A\", \"layer\": 6}";

	for (k=0 ; k<gender.length ; k++){
		for (j=0 ; j<names.length ; j++){
			var new_shield = templates;
			new_shield = new_shield.replace(/A/g,gender[k]); 
			new_shield = new_shield.replace(/B/g,names[j]); 
			images.push(JSON.parse(new_shield));
		}	
	}
	
	//cape
	colors = ['black', 'blue', 'brown', 'gray', 'green', 'lavender', 'pink', 'red', 'white', 'yellow'];
	var templates = ["{\"id\": \"cape_B\", \"path\": \"torso/back/cape/normal/female/cape_B.png\", \"parent\": \"cape\", \"layer\": 4, \"select\": \"cape_B_behind\", \"line\": 8}", "{\"id\": \"cape_B_behind\", \"path\": \"behind_body/cape/normal/female/cape_B.png\", \"parent\": \"none\", \"layer\": -1, \"line\": 8}", "{\"id\": \"tattercape_B\", \"path\": \"torso/back/cape/tattered/female/tattercape_B.png\", \"parent\": \"cape\", \"layer\": 4, \"select\": \"tattercape_B_behind\", \"line\": 8}", "{\"id\": \"tattercape_B_behind\", \"path\": \"behind_body/cape/tattered/female/tattercape_B.png\", \"parent\": \"none\", \"layer\": -1, \"line\": 8}"];
	for (i=0 ; i<2 ; i++){
		for (j=0 ; j<colors.length ; j++){
			var new_cape = templates.slice();
			new_cape[0+i*2] = new_cape[0+i*2].replace(/B/g,colors[j]); 
			new_cape[1+i*2] = new_cape[1+i*2].replace(/B/g,colors[j]); 
			images.push(JSON.parse(new_cape[0+i*2]));
			images.push(JSON.parse(new_cape[1+i*2]));
		}
	}

	//overside weapons sword pack
	var names = ['1', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'];
	var gender = ['male', 'female'];
	templates = "{\"id\": \"A_oversize_B\", \"path\": \"weapons/weapon pack/A/bigslash/B.png\", \"parent\": \"melee\", \"req\": \"A\", \"layer\": {\"default\": 6, \"down\": 7}, \"line\": 1, \"move\": \"slash\", \"oversize\": true, \"scale\": 3, \"posx\": 150, \"posy\": 110}";

	for (k=0 ; k<gender.length ; k++){
		for (j=0 ; j<names.length ; j++){
			var new_osw = templates;
			new_osw = new_osw.replace(/A/g,gender[k]); 
			new_osw = new_osw.replace(/B/g,names[j]); 
			images.push(JSON.parse(new_osw));
		}	
	}
	
}

function fetchSpritesheet(json) {
	var response = $.Deferred();
	var move = {
		'walk': {'sprites': 9, 'line': 8},
		'cast': {'sprites': 7, 'line': 0},
		'thrust': {'sprites': 8, 'line': 4},
		'slash': {'sprites': 6, 'line': 12},
		'shoot': {'sprites': 13, 'line': 16},
	};

	var errorload = false;
	try{
		json = JSON.parse(json);
	}
	catch(error){
		errorload = true;
		json = {};
	}

	var spritesheet = document.createElement("canvas");
	spritesheet.setAttribute("width", 192 * 13);
	spritesheet.setAttribute("height", 192 * 21);
	var spritectx = spritesheet.getContext("2d");
	
	var imgReady = 0;
	var selectedArray = [];
	for (var i in json){
		if (getImage(json[i]))
			selectedArray.push(getImage(json[i]));
	}
	if (!validate_skin(selectedArray))
		errorload = true;
	
	if (!errorload){
		selectedArray.sort(function(a, b){
			if (a.layer == null)
				return -1;
			else if (b.layer == null)
				return 1;
			else{
				if (typeof a.layer === 'object')
					a.layer = a.layer.down;
				if (typeof b.layer === 'object')
					b.layer = b.layer.down;
				return a.layer - b.layer;
			}
		});
		
		spritectx.clearRect(0, 0, spritesheet.width, spritesheet.height);
		var img = new Array();
		for(var i=0 ; i < selectedArray.length ; i++){
			if (selectedArray[i] && selectedArray[i].path != '' && !selectedArray[i].png){
				img[i] = new Image();	
				img[i].src = "sprite/Universal-LPC-spritesheet/" + selectedArray[i].path;
				img[i].onload = function() {
					imgReady++;
					if (imgReady == selectedArray.length){
						drawSprite();
						return response.resolve(spritesheet);
					}
				};
			}
			else{
				imgReady++;
				if (imgReady == selectedArray.length){
					drawSprite();
					return response.resolve(spritesheet);
				}
			}
		}
			
		function drawSprite() {
			for(var i=0 ; i < selectedArray.length ; i++){
				if (img[i]){
					if (selectedArray[i].oversize){
						var line = move[selectedArray[i].move].line;
						var sprites = move[selectedArray[i].move].sprites;
						for (var k=0 ; k<4 ; k++){
							for (var j=0 ; j<sprites ; j++){
								spritectx.drawImage(img[i], j*192, k*192, 192, 192, j*192, line*192 + k*192, 192, 192);
							}
						}
					}
					else{
						for (var k=0 ; k<21 ; k++){
							for (var j=0 ; j<13 ; j++){
								spritectx.drawImage(img[i], j*64, k*64, 64, 64, 64 + 3*j*64, 64 + 3*k*64, 64, 64);
							}
						}
					}
				}
			}
		}
	}
	else{
		var img = new Image();	
		img.src = "res/glad.png";
		img.onload = function() {
			for (var k=0 ; k<21 ; k++){
				for (var j=0 ; j<13 ; j++){
					spritectx.drawImage(img, j*64, k*64, 64, 64, 64 + 3*j*64, 64 + 3*k*64, 64, 64);
				}
			}
			return response.resolve(spritesheet);
		};
	}
	return response.promise();
}

function validate_skin(selectedArray){
	for (var i in selectedArray){
		if (selectedArray[i].parent == "shape"){
			return true;
		}
	}
	return false;
}

function getSpriteThumb(spritesheet, move, direction){
	var dirEnum = {
		'walk': {'row': 8, 'col': 0},
		'cast': {'row': 0, 'col': 0},
		'thrust': {'row': 4, 'col': 0},
		'slash': {'row': 12, 'col': 0},
		'shoot': {'row': 16, 'col': 0},
		'die': {'row': 20, 'col': 5},
		'up': 0,
		'left': 1,
		'down': 2,
		'right': 3,
	};
	var row = dirEnum[move].row + dirEnum[direction];
	var col = dirEnum[move].col;
	var thumb = document.createElement("canvas");
	thumb.setAttribute("width", 64);
	thumb.setAttribute("height", 64);
	var ctx = thumb.getContext("2d");
	ctx.drawImage(spritesheet, col*192 + 64, row*192 + 64, 64, 64, 0, 0, 64, 64); //10: linha do walk down
	return thumb;
}

function getImage(key){
	for (var i in images){
		if (images[i].id == key)
			return images[i];
	}
}
