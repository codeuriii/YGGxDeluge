import requests


def update_prowlarr_cookie():
    # Paramètres de connexion
    api_url = "http://192.168.1.253:9696/api/v1/indexer/11"  # ID de l'indexeur YggTorrent
    api_key = "aba331ee587245008bf5c2e0f06f376c"

    # Nouvelle valeur du cookie
    new_cookie_value = "account_created=true; v50_promo_details=eyJjb3VudGRvd25fZGF0ZSI6IjEwLzEwLzIwMjQgMjM6NTk6NTkiLCJ0cyI6MTcyODU5MDM5OX0=; hide_side_menu=true; ygg_=2lefhu7cef2u59uu1k44o1tsrppkc5qr"
    # new_cookie_value = "lol cookie"

    # En-têtes de la requête
    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json"
    }

    # Étape 1 : Récupérer les informations de l'indexeur
    response_get = requests.get(api_url, headers=headers)

    if response_get.status_code == 200:
        indexer_data = response_get.json()
        for d in indexer_data["fields"]:
            if d.get("name") == "cookie":
                d["value"] = new_cookie_value
                break

        # Étape 2 : Envoyer les nouvelles données via PUT
        response_put = requests.put(api_url, json=indexer_data, headers=headers)
        
        if response_put.status_code == 202:
            print("Cookie modifié avec succès")
        else:
            print(f"Erreur lors de la modification : {response_put.status_code}")
    else:
        print(f"Erreur lors de la récupération des infos de l'indexeur : {response_get.status_code}")


def start_rss_sync():
    pass

