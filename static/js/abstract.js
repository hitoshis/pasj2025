document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("program-table");
    const select = document.getElementById("categoryFilter");
    let allData = [];

    fetch("data/abstract.json")
        .then(response => response.json())
        .then(data => {
            allData = data;

            // カテゴリを収集してセレクトボックスに追加
            const categorySet = new Set();
            data.forEach(entry => {
                const cat = entry.category_1 || "未分類";
                categorySet.add(cat);
            });

            Array.from(categorySet).sort().forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat;
                select.appendChild(opt);
            });

            // 最初に全データ表示
            renderTable("ALL");

            // セレクト変更時に絞り込み
            select.addEventListener("change", () => {
                const selected = select.value;
                renderTable(selected);
            });
        })
        .catch(error => {
            table.innerHTML = "<tr><td colspan='2'>プログラムの取得に失敗しました!!!!。</td></tr>";
            console.error("Fetch error:", error);
        });

    function renderTable(categoryFilter) {
        table.innerHTML = ""; // クリア

        allData.forEach(entry => {
            const category = entry.category_1 || "未分類";
            if (categoryFilter !== "ALL" && category !== categoryFilter) return;

            const code = entry.submission_id || "NoCode";
            const title = entry.title_ja || "タイトル未定";
            const authors = entry.coauthors || [];

            const talkRow = document.createElement("tr");
            const abstractId = `abstract-${code}`;
            const abstract = entry.abstract_ja || "（要旨なし）";

            talkRow.innerHTML = `
              <td valign="top" width="50" nowrap>
                <b>${code}</b><br>
              </td>
              <td valign="top" align="left" width="100%">
                <a href="#" onclick="toggleAbstract('${abstractId}'); return false;"><b>${title}</b></a><br>
                ${renderAuthorsWithSuperscript(authors)}
                <div id="${abstractId}" style="display: none; margin-top: 0.5em;">
                  <b>要旨：</b><br>${abstract}
                </div>
              </td>
            `;

            table.appendChild(talkRow);
        });
    }


    function renderAuthorsWithSuperscript(authors) {
        const affiliationMap = new Map();  // 所属 → 添え字
        let affCounter = 1;

        const authorsHtml = authors.map(a => {
            if (!a.last_name || !a.first_name) return "";

            const mark = a.role && a.role.includes("登壇") ? "○" : "";
            const name = a.last_name + " " + a.first_name;
            const aff = (a.affiliation || "").trim();

            let affIndex = "";
            if (aff) {
                if (!affiliationMap.has(aff)) {
                    affiliationMap.set(aff, affCounter++);
                }
                affIndex = `<sup>${affiliationMap.get(aff)}</sup>`;
            }

            return `${mark}${name}${affIndex}`;
        }).filter(s => s).join(", ");

        const affHtml = Array.from(affiliationMap.entries())
            .map(([aff, idx]) => `<sup>${idx}</sup>${aff}`)
            .join(", ");

        return authorsHtml + "<br>" + affHtml + "<br>";
    }
});

function toggleAbstract(id) {
    const elem = document.getElementById(id);
    if (elem.style.display === "none") {
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
}
