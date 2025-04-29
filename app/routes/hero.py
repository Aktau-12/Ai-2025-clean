from fastapi.responses import JSONResponse

@router.get("/professions")
def get_professions_by_full_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    mbti_type = user.mbti_type
    archetype = user.archetype
    coretalents_top5 = []
    bigfive = {}

    results = db.query(UserResult).filter_by(user_id=user.id).all()
    for res in results:
        try:
            data = json.loads(res.answers)
            if res.test_id == 1:  # CoreTalents
                coretalents_top5 = sorted(data.items(), key=lambda x: x[1], reverse=True)[:5]
                coretalents_top5 = [str(talent_id) for talent_id, _ in coretalents_top5]
            elif res.test_id == 2:  # BigFive
                bigfive = data
        except Exception as e:
            print(f"Ошибка парсинга ответа теста {res.test_id}:", e)

    if not mbti_type or not archetype:
        raise HTTPException(status_code=400, detail="Профиль пользователя неполный (MBTI или архетип)")

    def match_professions(user_profile, professions, limit=5):
        def score(prof):
            s = 0
            if user_profile["archetype"] in prof.get("archetypes", []):
                s += 3
            if user_profile["mbti_type"] in prof.get("mbti", []):
                s += 2
            if user_profile["coretalents"]:
                common = set(prof.get("coretalents", [])) & set(user_profile["coretalents"])
                s += len(common)
            if user_profile["bigfive"]:
                for trait, value in prof.get("bigfive", {}).items():
                    if user_profile["bigfive"].get(trait) == value:
                        s += 1
            return s

        return sorted(professions, key=score, reverse=True)[:limit]

    profile = {
        "mbti_type": mbti_type,
        "archetype": archetype,
        "coretalents": coretalents_top5,
        "bigfive": bigfive
    }

    return JSONResponse(content=match_professions(profile, ALL_PROFESSIONS, limit=5))
